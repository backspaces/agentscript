// import { MathUtils } from 'three'
// import { typeOf } from './utils.js'
import * as gis from './gis.js'

// Create the world.bboxTransform
export function xfmFromBBox(model, bbox) {
    return model.world.bboxTransform(...bbox)
}
export function xfmFromZXY(model, Z, X, Y) {
    const bbox = gis.xyz2bbox(X, Y, Z)
    return model.world.bboxTransform(...bbox)
}

export function aspectRatio(bbox) {
    const [west, south, east, north] = bbox
    return Math.abs((east - west) / (north - south))
}

export function isGeojson(obj) {
    return typeof obj === 'object' && obj.type === 'FeatureCollection'
}

// Return deep copy of the given json file.
export function clone(json) {
    return JSON.parse(JSON.stringify(json))
}
// export function areEqual(json0, json1) {
//     return JSON.stringify(json0) === JSON.stringify(json1)
// }
// bin/minifyjson
export function minify(json) {
    if (typeof json === 'string') json = JSON.parse(json)
    const str = JSON.stringify(json) // compact form
    // newline for each feature
    // return str.replace(/,{"type":"Feature"/g, '\n,\n{"type":"Feature"')
    return str.replace(/{"type":"Feature"/g, '\n\n{"type":"Feature"')
}

// ========== features

export function featureCollection(features = []) {
    return {
        type: 'FeatureCollection',
        features: features,
    }
}
export function bboxFeature(bbox, properties = {}) {
    const coords = gis.bboxCoords(bbox)
    return {
        type: 'feature',
        geometry: {
            cordinates: coords,
            type: 'Polygon',
        },
        properties,
    }
}

// Flatten MultiLineStrings to single LineStrings features.
// Input can be a FeatureCollection or a Features array
// Return Features array
export function flattenMultiLineStrings(geojson) {
    const features = geojson.features || geojson
    const lineStrings = features.reduce((acc, obj) => {
        const geom = obj.geometry
        if (geom.type === 'LineString') {
            geom.coordinates.properties = obj.properties
            acc.push(geom.coordinates)
        } else if (geom.type === 'MultiLineString') {
            geom.coordinates.forEach(a => {
                a.properties = obj.properties
                acc.push(a)
            })
        }
        return acc
    }, [])
    return lineStrings
}

// Convert LineStrings to Links.
// Input can be a FeatureCollection or a Features array
// Return an array of new Turtles & Links
export function lineStringsToLinks(model, bbox, lineStrings) {
    const xfm = xfmFromBBox(model, bbox)
    lineStrings = flattenMultiLineStrings(lineStrings)
    const nodeCache = {}
    const newTurtles = []
    const newLinks = []
    function getNode(pt) {
        const key = pt.toString()
        let node = nodeCache[key]
        if (node) return node
        node = model.turtles.createOne(t => {
            // t.setxy(...model.world.toWorld(...pt))
            t.setxy(...xfm.toWorld(pt))
            t.lon = pt[0]
            t.lat = pt[1]
        })
        nodeCache[key] = node
        newTurtles.push(node)
        return node
    }
    function newLink(pt0, pt1) {
        const t0 = getNode(pt0)
        const t1 = getNode(pt1)
        const link = model.links.createOne(t0, t1)
        newLinks.push(link)
        return link
    }
    function lineStringToLinks(lineString) {
        lineString.reduce((acc, pt, i, a) => {
            const link = newLink(a[i - 1], pt)
            if (i === 1) {
                acc = [link]
                acc.properties = lineString.properties
            } else {
                acc.push(link)
            }
            link.lineString = acc
            return acc
        })
    }
    lineStrings.forEach(lineString => lineStringToLinks(lineString))
    return [newTurtles, newLinks]
}

// https://github.com/tmcw/geojson-flatten
export function flatten(gj) {
    switch ((gj && gj.type) || null) {
        case 'FeatureCollection':
            gj.features = gj.features.reduce(function (mem, feature) {
                return mem.concat(flatten(feature))
            }, [])
            return gj
        case 'Feature':
            if (!gj.geometry) return [gj]
            return flatten(gj.geometry).map(function (geom) {
                var data = {
                    type: 'Feature',
                    properties: JSON.parse(JSON.stringify(gj.properties)),
                    geometry: geom,
                }
                if (gj.id !== undefined) {
                    data.id = gj.id
                }
                return data
            })
        case 'MultiPoint':
            return gj.coordinates.map(function (_) {
                return { type: 'Point', coordinates: _ }
            })
        case 'MultiPolygon':
            return gj.coordinates.map(function (_) {
                return { type: 'Polygon', coordinates: _ }
            })
        case 'MultiLineString':
            return gj.coordinates.map(function (_) {
                return { type: 'LineString', coordinates: _ }
            })
        case 'GeometryCollection':
            return gj.geometries.map(flatten).reduce(function (memo, geoms) {
                return memo.concat(geoms)
            }, [])
        case 'Point':
        case 'Polygon':
        case 'LineString':
            return [gj]
    }
}

// https://github.com/geosquare/geojson-bbox
export function bbox(gj) {
    var coords, bbox
    if (!gj.hasOwnProperty('type')) return
    coords = getCoordinates(gj)
    bbox = [
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
    ]
    return coords.reduce(function (prev, coord) {
        return [
            Math.min(coord[0], prev[0]),
            Math.min(coord[1], prev[1]),
            Math.max(coord[0], prev[2]),
            Math.max(coord[1], prev[3]),
        ]
    }, bbox)
}
export function getCoordinates(gj) {
    switch (gj.type) {
        case 'Point':
            return [gj.coordinates]
        case 'LineString':
        case 'MultiPoint':
            return gj.coordinates
        case 'Polygon':
        case 'MultiLineString':
            return gj.coordinates.reduce(function (dump, part) {
                return dump.concat(part)
            }, [])
        case 'MultiPolygon':
            return gj.coordinates.reduce(function (dump, poly) {
                return dump.concat(
                    poly.reduce(function (points, part) {
                        return points.concat(part)
                    }, [])
                )
            }, [])
        case 'Feature':
            return getCoordinates(gj.geometry)
        case 'GeometryCollection':
            return gj.geometries.reduce(function (dump, g) {
                return dump.concat(getCoordinates(g))
            }, [])
        case 'FeatureCollection':
            return gj.features.reduce(function (dump, f) {
                return dump.concat(getCoordinates(f))
            }, [])
    }
}
