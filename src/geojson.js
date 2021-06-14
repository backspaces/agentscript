import * as gis from './gis.js'

// Create the world.bboxTransform
export function xfmFromBBox(model, bbox) {
    return model.world.bboxTransform(...bbox)
}
export function xfmFromZXY(model, Z, X, Y) {
    const bbox = gis.xy2bbox(X, Y, Z)
    return model.world.bboxTransform(...bbox)
}

// Return deep copy of the given json file.
export function clone(json) {
    return JSON.parse(JSON.stringify(json))
}

// ========== features

export function featureCollection(features = []) {
    return {
        type: 'FeatureCollection',
        features: features,
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
export function lineStringsToLinks(model, lineStrings) {
    lineStrings = flattenMultiLineStrings(lineStrings)
    const nodeCache = {}
    const newTurtles = []
    const newLinks = []
    function getNode(pt) {
        const key = pt.toString()
        let node = nodeCache[key]
        if (node) return node
        node = model.turtles.createOne(t => {
            t.setxy(...model.world.toWorld(...pt))
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
