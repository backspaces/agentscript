import util from './util.js'
import RGBDataSet from './RGBDataSet.js'

// ================= Core URL/Decoding Paris Functions ===============

export function rgbToInt24(r, g, b) {
    return r * 256 * 256 + g * 256 + b
}
export function rgbScaleFunction(min, scale) {
    return (r, g, b) => min + (r * 256 * 256 + g * 256 + b) * scale
}

// ============= OSM (Open Street Map)
export function osmUrl(z, x, y) {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
}

// ============= MapTiler =============
// https://api.maptiler.com/maps/streets/14/3370/6451.png?key=iQurAP6lArV1UP4gfSVs
// type = 'street' (default); 'topo',
export function maptilerUrl(z, x, y, key, type = 'street') {
    return `https://api.maptiler.com/maps/${type}/${z}/${x}/${y}.png?key=${key}`
}

// ============= MapZen =============
// amazon/mapzen: https://registry.opendata.aws/tag/elevation/
export function mapzenElevation() {
    return rgbScaleFunction(-32768, 1 / 256)
}
export function mapzenUrl(z, x, y) {
    return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`
}

// ============= MapBox =============
// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/
export function mapboxElevation() {
    return rgbScaleFunction(-10000, 0.1)
}
export function mapboxUrl(z, x, y, token, type = 'terrain-rgb') {
    return `https://api.mapbox.com/v4/mapbox.${type}/${z}/${x}/${y}.png?access_token=${token}`
}

// ============= RedFish =============
export function redfishElevation(r, g, b) {
    let negative = 1 // From RGB2DeciMeters()
    if (r > 63) {
        negative = -1
        r = 0
    }
    return (negative * (r * 256 * 256 + g * 256 + b)) / 10
}
export function redfishUSAUrl(z, x, y) {
    return `https://s3-us-west-2.amazonaws.com/simtable-elevation-tiles/${z}/${x}/${y}.png`
}
export function redfishWorldUrl(z, x, y) {
    return `https://s3-us-west-2.amazonaws.com/world-elevation-tiles/DEM_tiles/${z}/${x}/${y}.png`
}

// ================= Simplified DataSet Factories ===============

export async function redfishUSDataSet(z, x, y, ArrayType = Float32Array) {
    const tileUrl = redfishUSAUrl(z, x, y)
    const tileDecoder = redfishElevation
    const img = await util.imagePromise(tileUrl)
    return new RGBDataSet(img, tileDecoder, ArrayType)
}

export async function redfishWorldDataSet(z, x, y, ArrayType = Float32Array) {
    const tileUrl = redfishWorldUrl(z, x, y)
    const tileDecoder = redfishElevation
    const img = await util.imagePromise(tileUrl)
    return new RGBDataSet(img, tileDecoder, ArrayType)
}

export async function mapzenDataSet(z, x, y, ArrayType = Float32Array) {
    const tileUrl = mapzenUrl(z, x, y)
    const tileDecoder = mapzenElevation()
    const img = await util.imagePromise(tileUrl)
    return new RGBDataSet(img, tileDecoder, ArrayType)
}

export async function mapboxDataSet(z, x, y, token, ArrayType = Float32Array) {
    const tileUrl = mapboxUrl(z, x, y, token)
    const tileDecoder = mapboxElevation()
    const img = await util.imagePromise(tileUrl)
    return new RGBDataSet(img, tileDecoder, ArrayType)
}
