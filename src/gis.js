// import * as util from '../src/utils.js'

const { PI, atan, atan2, cos, floor, log, pow, sin, sinh, sqrt, tan } = Math
const radians = degrees => (degrees * PI) / 180
const degrees = radians => (radians * 180) / PI

// Tile Helpers http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
export function lon2x(lon, z) {
    return floor(((lon + 180) / 360) * pow(2, z))
}
export function lat2y(lat, z) {
    const latRads = radians(lat)
    return floor(
        (1 - log(tan(latRads) + 1 / cos(latRads)) / PI) * pow(2, z - 1)
    )
}
export function lonlat2xy(lon, lat, z) {
    return [this.lon2x(lon, z), this.lat2y(lat, z)]
}

export function x2lon(x, z) {
    return (x / pow(2, z)) * 360 - 180
}
export function y2lat(y, z) {
    const rads = atan(sinh(PI - (2 * PI * y) / pow(2, z)))
    return degrees(rads)
}
export function xy2lonlat(x, y, z) {
    return [this.x2lon(x, z), this.y2lat(y, z)]
}
// Return two lon/lat points for bbox of tile
// We use the usual convention of
//   [minX, minY, maxX, maxY] or [west, south, east, north]
export function xy2bbox(x, y, z) {
    // REMIND: error check at 180, 0 etc
    // const [lon0, lat0] = this.xy2lonlat(x, y, z)
    const [west, north] = this.xy2lonlat(x, y, z)
    // console.log('west, north', west, north)
    // tile Y increases "down" like pixel coords
    // const [lon1, lat1] = this.xy2lonlat(x + 1, y + 1, z)
    const [east, south] = this.xy2lonlat(x + 1, y + 1, z)
    // console.log('south, east', south, east)
    // west, south, east, north
    // lon0, lat1, lon1, lat0
    return [west, south, east, north]
    // return [
    //     [lon0, lat0],
    //     [lon1, lat1],
    // ]
}
export function lonLat2bbox(lon, lat, z) {
    const [x, y] = this.lonlat2xy(lon, lat, z)
    return this.xy2bbox(x, y, z)
}

export function bboxCenter(bbox) {
    const [west, south, east, north] = bbox
    return [(west + east) / 2, (south + north) / 2]
}
export function bboxCoords(bbox) {
    const [west, south, east, north] = bbox
    return [
        [west, north],
        [east, north],
        [east, south],
        [west, south],
    ]
}

// Create a url for OSM json data.
// https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
// south, west, north, east = minLat, minLon, maxLat, maxLon
export function getOsmURL(south, west, north, east) {
    const url = 'https://overpass-api.de/api/interpreter?data='
    const params = `\
[out:json][timeout:180][bbox:${south}${west}${north}${east}];
way[highway];
(._;>;);
out;`
    return url + encodeURIComponent(params)
}

// https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
// Explanation: https://en.wikipedia.org/wiki/Haversine_formula
export function lonLat2meters(pt1, pt2) {
    const [lon1, lat1] = pt1.map(val => radians(val)) // lon/lat radians
    const [lon2, lat2] = pt2.map(val => radians(val))

    // generally used geo measurement function
    const R = 6378.137 // Radius of earth in KM
    const dLat = lat2 - lat1
    const dLon = lon2 - lon1
    const a = sin(dLat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dLon / 2) ** 2
    // pow(sin(dLat / 2), 2) +
    // cos(lat1) * cos(lat2) * sin(dLon / 2) * sin(dLon / 2)
    const c = 2 * atan2(sqrt(a), sqrt(1 - a))
    const d = R * c
    return d * 1000 // meters
}

// geojson utilities: use src/geojson.js
// export function cloneJson(json) {
//     return JSON.parse(JSON.stringify(json))
// }
// export function areEqual(json0, json1) {
//     return JSON.stringify(json0) === JSON.stringify(json1)
// }
// // bin/minifyjson
// export function minify(json) {
//     const str = JSON.stringify(json) // compact form
//     // newline for each feature
//     return str.replace(/,{"type":"Feature"/g, '\n,\n{"type":"Feature"')
// }
