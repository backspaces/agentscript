// import { typeOf } from './utils.js'
import * as gis from './gis.js'

// /** @exports */
/** @module */

export function isGeojson(obj) {
    return typeof obj === 'object' && obj.type === 'FeatureCollection'
}

// Return deep copy of the given json file.
export function clone(json) {
    return JSON.parse(JSON.stringify(json))
}

export function minify(json) {
    if (typeof json === 'string') json = JSON.parse(json)
    const str = JSON.stringify(json) // compact form
    // newline for each feature
    return str.replace(/},{/g, '},\n\n{')
}

// ========== features

export function bboxFeature(bbox, properties = {}) {
    const coords = gis.bboxCoords(bbox)
    coords.push(coords[0]) // polys are closed, repeat first coord
    return {
        type: 'Feature',
        geometry: {
            cordinates: coords,
            type: 'Polygon',
        },
        properties,
    }
}

/**
 * Flatten MultiLineStrings to single LineStrings features.
 * @param {FeatureCollection|Array<Features>} geojson a FeatureCollection or Features array
 * @returns Features array
 */
export function flattenMultiLineStrings(geojson, cloneJson = true) {
    if (cloneJson) geojson = clone(geojson)
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

/**
 * @param {Model} model Instance of Model
 * @param {Array<number>} bbox [west, south, east, north] Gis BBox
 * @param {FeatureCollection|Array<Features>} lineStrings geojson features
 * @returns {Turtles|Links} Return an array of new Turtles & Links
 */
export function lineStringsToLinks(model, bbox, lineStrings) {
    // const xfm = xfmFromBBox(model, bbox)
    const xfm = model.world.xfm || model.world.bboxTransform(...bbox)
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
export function flatten(gj, cloneJson = true) {
    if (cloneJson) gj = clone(gj)
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
export function geojsonBBox(gj) {
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
