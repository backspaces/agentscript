import { xyInBBox } from './gis.js'
import { clone } from './geojson.js'

// util has it's own, this used locally in pathFilter
function nestedProperty(obj, path) {
    if (typeof path === 'string') path = path.split('.')
    return path.reduce((obj, param) => obj[param], obj)
}

// turf.flatten()
// bin/demultline (roads has it's own)
export function flattenMultiLineStrings(json, cloneJson = true) {
    if (cloneJson) json = clone(json)

    const features = []
    json.features.forEach(feature => {
        if (feature.geometry.type === 'MultiLineString') {
            feature.geometry.coordinates.forEach(coords => {
                const copy = Object.assign({}, feature)
                copy.geometry.type = 'LineString'
                copy.geometry.coordinates = coords
                features.push(copy)
            })
        } else {
            features.push(feature)
        }
    })
    json.features = features
    return json
}

export function bboxFilter(json, bbox, cloneJson = true) {
    if (cloneJson) json = clone(json)

    const features = json.features.filter(feature => {
        let coords = feature.geometry.coordinates
        coords = coords.filter(pt => xyInBBox(bbox, pt))

        // if (coords.length !== feature.geometry.coordinates.length)
        //     console.log(
        //         feature.geometry.coordinates.length,
        //         '->',
        //         coords.length
        //     )

        feature.geometry.coordinates = coords
        return coords.length >= 2
    })
    json.features = features
    return json
}

// ========= REMIND: refactor into bin/

// AS: Used locally only, pathFilter
// MB: nmcounties npm script
// The most general filter: keeps a feature only if
// filterFcn(feature, i, features) returns true.
// The filterFcn can also modify feature properties.
// json is mutated, equals the return value (sugar)
export function featureFilter(json, filterFcn) {
    json.features = json.features.filter(filterFcn)
    return json
}

// Used locally only, geometryFilter & streetsFilter
// Filter by a property (path) matching one of values array.
export function pathFilter(json, featurePath, values) {
    if (typeof values === 'string') values = values.split(' ')
    featureFilter(json, feature => {
        const value = nestedProperty(feature, featurePath)
        return values.includes(value)
    })
    return json
}

// The above specific to geometry (Point, Polygon, LineString)
export function geometryFilter(json, values, cloneJson = true) {
    if (cloneJson) json = clone(json)

    return pathFilter(json, 'geometry.type', values)
}

// Reduces the feature properties to only those in the properties array.
export function propertiesFilter(json, properties, cloneJson = true) {
    if (cloneJson) json = clone(json)

    if (typeof properties === 'string') properties = properties.split(' ')
    json.features.forEach(feature => {
        const obj = {}
        properties.forEach(prop => {
            if (feature.properties[prop] !== undefined) {
                obj[prop] = feature.properties[prop]
            }
        })
        feature.properties = obj
    })
    return json
}

// AS: bin/json2roads; only used in MB.mkTiles w/ tippecanoe
// service highways could be of interest too, esp fire/emergency
//     "highway": "service",
//     "service": "xxx" where service is (in santafe zoom 10)
//    6     "service": "emergency_access"
//  120     "service": "alley"
//  141     "service": "drive-through"
// 1300     "service": "driveway"
// 1506     "service": "parking_aisle"
export const osmStreetTypes = [
    'motorway',
    'trunk',
    'residential',
    'primary',
    'secondary',
    'tertiary',
    'motorway_link',
    'trunk_link',
    'primary_link',
    'secondary_link',
    'tertiary_link',
]
export const osmStreetProperties = [
    'highway',
    'oneway',
    'name',
    'tiger:name_base',
]
// A simple filter for streets.
// Filters for:
//   - LineString geometry
//   - highways matching streetTypes array, defaulted to above
//   - properties reduced to streetProperties, defaulted to above
export function streetsFilter(
    json,
    streetTypes = osmStreetTypes,
    streetProperties = osmStreetProperties,
    cloneJson = true
) {
    if (cloneJson) json = clone(json)

    geometryFilter(json, 'LineString')
    // see https://wiki.openstreetmap.org/wiki/Highways
    // note motorway_junction's are Point geometries
    pathFilter(json, 'properties.highway', streetTypes)
    propertiesFilter(json, streetProperties)
    return json
}
