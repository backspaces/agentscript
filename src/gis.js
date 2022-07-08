// import * as util from '../src/utils.js'

// /** @namespace */
/** @module */

const { PI, atan, atan2, cos, floor, log, pow, sin, sinh, sqrt, tan, abs } =
    Math
const radians = degrees => (degrees * PI) / 180
const degrees = radians => (radians * 180) / PI

// Current gis and geoJson uses lon/lat coords, i.e. x,y.
// This converts to latlon, i.e. y,x.
/**
 * Current gis and geoJson uses [lon, lat] coords, i.e. x,y.
 * - This converts these to [lat, lon], i.e. y,x as used by leaflet
 * - If Array contains multiple [lon, lat] subarrays, convert them all
 *
 * @param {Array} latlon Convert a [lon, lat] to [lat, lon]. If Array of Array, perform latlon on each
 * @returns [lat, lon]
 */
export function latlon(lonlat) {
    if (typeof lonlat[0] !== 'number') return lonlat.map(val => latlon(val))
    return [lonlat[1], lonlat[0]]
}

// Tiles use a ZXY corrd system. We use lower case below.
// Tile Helpers http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
// Convert lon,lats to tile X,Ys
export function lonz2xFloat(lon, z){
    return ((lon + 180) / 360) * pow(2, z)
}
export function latz2yFloat(lat, z){
    const latRads = radians(lat)
    let y = (1 - log(tan(latRads) + 1 / cos(latRads)) / PI) * pow(2, z - 1)
    return y
}
export function lonz2x(lon, z) {
    return floor(lonz2xFloat(lon, z))
}
export function latz2y(lat, z, roundInt = false) {
    let y = latz2yFloat(lat, z)
    if (roundInt && Number.isInteger(y)) return y - 1
    return floor(y)
}
export function lonlatz2xy(lon, lat, z, roundLat = false) {
    return [lonz2x(lon, z), latz2y(lat, z, roundLat)]
}
// export function lonlatz2xyz(lon, lat, z) {
//     return [lonz2x(lon, z), latz2y(lat, z), z]
// }

// returns top-left, or north-west lon, lat of given tile X Y Z's
// adding 1 to either x,y or both gives other corner lonlats
export function xz2lon(x, z) {
    return (x / pow(2, z)) * 360 - 180
}
export function yz2lat(y, z) {
    const rads = atan(sinh(PI - (2 * PI * y) / pow(2, z)))
    return degrees(rads)
}
export function xyz2lonlat(x, y, z) {
    return [xz2lon(x, z), yz2lat(y, z)]
}
// adding 0.5 to x,y returns lonlat of center of tile
export function xyz2centerLonlat(x, y, z) {
    return [xz2lon(x + 0.5, z), yz2lat(y + 0.5, z)]
}

// Return a tile bbox for xyz tile.
// x,y any point within the tile like center etc.
// We use the usual bbox convention of
//   [minX, minY, maxX, maxY] or [west, south, east, north]
export function xyz2bbox(x, y, z) {
    const [west, north] = xyz2lonlat(x, y, z)
    const [east, south] = xyz2lonlat(x + 1, y + 1, z)
    return [west, south, east, north]
}

// export function bbox2xyz(bbox) {
//     const [west, south, east, north] = bbox
//     const [x0, y0] = lonlatz2xy(west,)
// }
// export function lonLatz2bbox(lon, lat, z) {
//     const [x, y] = lonlatz2xy(lon, lat, z)
//     return xyz2bbox(x, y, z) ???
// }
// export function xyz2zxy(xyz) {
//     const [x, y, z] = xyz
//     return [z, x, y]
// }

// Leaflet style latlon corners to bbox
// "bouonds" uses leaflet's latlon while "bbox" uses our lonlat
export function Lbounds2bbox(leafletBounds) {
    // let { lng: east, lat: north } = leafletBounds.getNorthEast()
    // let { lng: west, lat: south } = leafletBounds.getSouthWest()
    let { lng: west, lat: north } = leafletBounds.getNorthWest() // topLeft
    let { lng: east, lat: south } = leafletBounds.getSouthEast() // bottomRight
    return [west, south, east, north]
}

export function tilesBBox(bbox, z) {
    const [west, south, east, north] = bbox
    const [westX, northY] = lonlatz2xy(west, north, z)
    let [eastX, southY] = lonlatz2xy(east, south, z, true)
    // if (Number.isInteger(eastX)) eastX--
    // if (Number.isInteger(southY)) southY--
    return [westX, southY, eastX, northY]
}

export function bboxCoords(bbox) {
    const [west, south, east, north] = bbox
    return [
        [west, north], // topLeft
        [east, north], // topRight
        [east, south], // botRight
        [west, south], // botLeft
    ]
}
export function bboxBounds(bbox) {
    const [west, south, east, north] = bbox
    return [
        [west, north], // topLeft
        [east, south], // botRight
    ]
}

export function bboxCenter(bbox) {
    const [west, south, east, north] = bbox
    return [(west + east) / 2, (south + north) / 2]
}
export function bboxFromCenter(center, dLon = 1, dLat = dLon) {
    let [lon, lat] = center
    return [lon - dLon, lat - dLat, lon + dLon, lat + dLat]
}

export const santaFeCenter = [-105.978, 35.66] // from leaflet click popup
export const santaFeBBox = bboxFromCenter(santaFeCenter, 0.2, 0.1)
export const newMexicoBBox = [-109.050044, 31.332301, -103.001964, 37.000104]

export function bboxSize(bbox) {
    const [west, south, east, north] = bbox
    const width = abs(west - east)
    const height = abs(north - south)
    return [width, height]
}
export function bboxAspect(bbox) {
    const [width, height] = bboxSize(bbox)
    return width / height
}
export function bboxMetricSize(bbox) {
    const [west, south, east, north] = bbox
    const topLeft = [west, north]
    const botLeft = [west, south]
    const topRight = [east, north]
    const width = lonLat2meters(topLeft, topRight)
    const height = lonLat2meters(topLeft, botLeft)
    return [width, height]
}
export function bboxMetricAspect(bbox) {
    const [width, height] = bboxMetricSize(bbox)
    return width / height
}

// Create a url for OSM json data.
// https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
// south, west, north, east = minLat, minLon, maxLat, maxLon
export function getOsmURL(south, west, north, east) {
    const url = 'https://overpass-api.de/api/interpreter?data='
    const params = `\
[out:json][timeout:180][bbox:${south},${west},${north},${east}];
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

// https://github.com/leaflet-extras/leaflet-providers
// https://github.com/leaflet-extras/leaflet-providers/blob/master/leaflet-providers.js
export function attribution(who = 'osm') {
    const prefix = 'Map data &copy; '
    switch (who) {
        case 'osm':
            return (
                prefix + '<a href="https://openstreetmap.org">OpenStreetMap</a>'
            )
        case 'topo':
            return prefix + '<a href="https://opentopomap.org">OpenTopoMap</a>'
        // case 'topo':
        //     return prefix + '<a href="https://opentopomap.org">OpenTopoMap</a>'
        case 'topo1':
            return (
                prefix + '<a  href="https://www.maptiler.com">OpenTopoMap</a>'
            )
        case 'smooth':
            return prefix + '<a href="https://stadiamaps.com/">Stadia Maps</a>'
        case 'usgs':
            return (
                prefix +
                'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
            )
    }
}
export function template(who = 'osm') {
    switch (who) {
        case 'osm':
            return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        case 'topo':
            return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        case 'topo1':
            return 'https://api.maptiler.com/maps/topo/{z}/{x}/{y}.png?key=iQurAP6lArV1UP4gfSVs'
        case 'smooth':
            return 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png'
        case 'usgs':
            return 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}'
    }
}
export function url(z, x, y, who = 'osm') {
    switch (who) {
        case 'osm':
            return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
        case 'topo':
            return `https://tile.opentopomap.org/${z}/${x}/${y}.png`
        case 'topo1':
            return `https://api.maptiler.com/maps/topo/${z}/${x}/${y}.png?key=iQurAP6lArV1UP4gfSVs`
        case 'smooth':
            return `https://tiles.stadiamaps.com/tiles/alidade_smooth/${z}/${x}/${y}{r}.png`
        case 'usgs':
            return `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/${z}/${y}/${x}`
    }
}

