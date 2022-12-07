import * as util from '../src/utils.js'

// This module primarily manages various GIS structures:
// * xyz: The slippy map coords array [x, y, z(oom)] integers.
//   http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
// * lon, lat: Longitude/latitude (in x, y .. lon, lat order)
// * points: [lon, lat] arrays
// * bbox: an array of [west, south, east, north] lon/lat values
//   Note the order is (minx, miny, maxx, maxy), another semi standard
// * tile: a 256 x 256 image used in slippy maps at a xyz map location
// See:  https://macwright.com/lonlat/ which we follow
// Note there is a simple conversion for [lat, lon] coord orders: latlon(lonlat)

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

// There are two coord systems here: tile X/Y & zoom coords and lon/lat Coords
// This can be quite confusing:
// Tiles have the top/left as the 0,0 origin, with positive x,y coords "down"
// LonLat are both in degrees, lon: -180/+180 and lat: ~85/-~85 in degrees
// So tiles are like pixel coords (scaled by 2**zoom), and lonlat euclidean degrees.

// Tiles use a ZXY corrd system. We use lower case for these below.
// Tile Helpers http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
// Convert lon,lats to tile X,Ys
// Although XYZs for tiles are all integrs, we provide float versions as
// well for things like finding the distance of an arbitrary lonlat to
// the edges of the tile
export function lonz2xFloat(lon, z) {
    return ((lon + 180) / 360) * pow(2, z)
}
export function lonz2x(lon, z) {
    return floor(lonz2xFloat(lon, z))
}

export function latz2yFloat(lat, z) {
    const latRads = radians(lat)
    return (1 - log(tan(latRads) + 1 / cos(latRads)) / PI) * pow(2, z - 1)
}
export function latz2y(lat, z) {
    return floor(latz2yFloat(lat, z))
}

export function lonlatz2xyFloat(lon, lat, z) {
    return [lonz2xFloat(lon, z), latz2yFloat(lat, z)]
}
export function lonlatz2xy(lon, lat, z) {
    return [lonz2x(lon, z), latz2y(lat, z)]
}

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

// Return a lonlat bbox for xyz tile.
// x,y any point within the tile like center etc.
// We use the usual bbox convention of
//   [minX, minY, maxX, maxY] or [west, south, east, north]
export function xyz2bbox(x, y, z, digits = null) {
    const [west, north] = xyz2lonlat(x, y, z)
    const [east, south] = xyz2lonlat(x + 1, y + 1, z)
    if (!digits) return [west, south, east, north]
    return util.precision([west, south, east, north], digits)
}

export function xyInBBox(bbox, pt) {
    const [west, south, east, north] = bbox
    const [x, y] = pt // lon, lats
    return util.isBetween(x, west, east) && util.isBetween(y, south, north)
}

// export function bbox2xyz(bbox) {
//     const [west, south, east, north] = bbox
//     const [x0, y0] = lonlatz2xy(west,)
// }
export function lonLatz2bbox(lon, lat, z) {
    const [x, y] = lonlatz2xy(lon, lat, z)
    return xyz2bbox(x, y, z)
}
// export function xyz2zxy(xyz) {
//     const [x, y, z] = xyz
//     return [z, x, y]
// }

// Leaflet style latlon corners to bbox
// "bouonds" uses leaflet's latlon while "bbox" uses our lonlat
// https://leafletjs.com/reference.html#latlngbounds
// this may not be needed: leaflet allows [lat, lon] arrays
// where every latlng bounds are used.
export function Lbounds2bbox(leafletBounds) {
    // let { lng: east, lat: north } = leafletBounds.getNorthEast()
    // let { lng: west, lat: south } = leafletBounds.getSouthWest()
    let { lng: west, lat: north } = leafletBounds.getNorthWest() // topLeft
    let { lng: east, lat: south } = leafletBounds.getSouthEast() // bottomRight
    return [west, south, east, north]
}

// given a gis bbox, return the corners of the surounding tiles, in tile XY coords
export function tilesBBox(bbox, z) {
    const [west, south, east, north] = bbox
    const [westX, northY] = lonlatz2xy(west, north, z)
    let [eastX, southY] = lonlatz2xyFloat(east, south, z)
    eastX = floor(eastX)
    southY = Number.isInteger(southY) ? southY - 1 : floor(southY)
    return [westX, southY, eastX, northY]
}

export function bboxCenter(bbox) {
    const [west, south, east, north] = bbox
    return [(west + east) / 2, (south + north) / 2]
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

// Return a geojson feature for this bbox
export function bboxFeature(bbox, properties = {}) {
    const coords = bboxCoords(bbox)
    coords.push(coords[0]) // polys are closed, repeat first coord
    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [coords],
        },
        properties,
    }
}

export function bboxFromCenter(center, dLon = 1, dLat = dLon) {
    let [lon, lat] = center
    return [lon - dLon, lat - dLat, lon + dLon, lat + dLat]
}

export const santaFeCenter = [-105.978, 35.66] // from leaflet click popup
export const santaFeBBox = bboxFromCenter(santaFeCenter, 0.2, 0.1)
export const newMexicoBBox = [-109.050044, 31.332301, -103.001964, 37.000104]
export const newMexicoCenter = bboxCenter(newMexicoBBox)
export const usaBBox = [-124.733174, 24.544701, -66.949895, 49.384358]
export const usaCenter = bboxCenter(usaBBox)

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
// https://wiki.openstreetmap.org/wiki/Downloading_data shows a newer url
// https://api.openstreetmap.org/api/0.6/map?bbox=11.54,48.14,11.543,48.145
export function getOsmURL(south, west, north, east) {
    const url = 'https://overpass-api.de/api/interpreter?data='
    const params = `\
[out:json][timeout:180][bbox:${south},${west},${north},${east}];
way[highway];
(._;>;);
out;`
    return url + encodeURIComponent(params)
}
// Use the osm url to grab data. The overpass wiki sez:
// The API is limited to bounding boxes of about 0.5 degree by 0.5 degree
export async function bbox2osm(bbox) {
    const [west, south, east, north] = bbox
    const url = getOsmURL(south, west, north, east)
    const osm = await fetch(url).then(resp => resp.json())
    return osm
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
    throw Error('gis.attribution: name unknown:', who)
}
export function template(who = 'osm') {
    switch (who) {
        case 'osm':
            return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        case 'topo':
            return 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png'
        case 'topo1':
            return 'https://api.maptiler.com/maps/topo/{z}/{x}/{y}.png?key=iQurAP6lArV1UP4gfSVs'
        case 'smooth':
            return 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png'
        case 'usgs': // doesn't use .png extension
            return 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}'
        case 'contour':
            return 'https://api.maptiler.com/tiles/contours/tiles.json?key=iQurAP6lArV1UP4gfSVs'
        // case 'contour':
        //     return 'https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSImageryTopo/MapServer/tile/{z}/{x}/{y}'
        // case 'contour1':
        //     return 'https://api.maptiler.com/tiles/contours/{z}/{x}/{y}.pbf?key=iQurAP6lArV1UP4gfSVs'
    }
    throw Error('gis.template: name unknown:', who)
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
    throw Error('gis.url: name unknown:', who)
}
export function elevationTemplate(who = 'mapzen') {
    switch (who) {
        case 'mapzen':
            return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`
        case 'maptiler':
            return `https://api.maptiler.com/tiles/terrain-rgb/{z}/{x}/{y}.png?key=iQurAP6lArV1UP4gfSVs`
        case 'redfishUSA':
            return `https://s3-us-west-2.amazonaws.com/simtable-elevation-tiles/{z}/{x}/{y}.png`
        case 'redfishWorld':
            return `https://s3-us-west-2.amazonaws.com/world-elevation-tiles/DEM_tiles/{z}/{x}/{y}.png`
        case 'mapbox':
            return (
                `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=` +
                'pk.eyJ1IjoiYmFja3NwYWNlcyIsImEiOiJjanVrbzI4dncwOXl3M3ptcGJtN3oxMmhoIn0.x9iSCrtm0iADEqixVgPwqQ'
            )
    }
    throw Error('gis.elevationTemplate: name unknown:', who)
}
