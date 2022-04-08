import * as util from './utils.js'
import RGBDataSet from './RGBDataSet.js'

export function rgbToInt24(r, g, b) {
    return r * 256 * 256 + g * 256 + b
}
export function rgbScaleFunction(min, scale) {
    return (r, g, b) => min + (r * 256 * 256 + g * 256 + b) * scale
}

// ============= BaseMaps =============

// ============= OSM (Open Street Map)
export function osmUrl(z, x, y) {
    if (!z) return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
}

// ============= Stamen
// http://tile.stamen.com/toner/{z}/{x}/{y}.png
// http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg
// http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg

// http://maps.stamen.com/
// type: toner, watercolor, terrain and variations amongst them all.
export function stamenUrl(z, x, y, type = 'terrain') {
    const fmt = type.includes('toner') ? 'png' : 'jpg'
    return `http://tile.stamen.com/${type}/${z}/${x}/${y}.${fmt}`
}

// ------------ MapTiler
// https://cloud.maptiler.com/tiles/
// type = basic streets topo bright outdoor pastel'
// jpeg: https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=iQurAP6lArV1UP4gfSVs'
export function maptilerUrl(z, x, y, key, type = 'basic') {
    const fmt = type === 'hybrid' ? 'jpg' : 'png'
    return `https://api.maptiler.com/maps/${type}/${z}/${x}/${y}.${fmt}?key=${key}`
}

// http://maps.stamen.com/#watercolor/12/37.7706/-122.3782

// ============= Elevation Tiles & Decoders =============

// ------------ MapZen
// amazon/mapzen: https://registry.opendata.aws/tag/elevation/
// nextzen (long term mapzen): https://www.nextzen.org/
// nextzen api key: YlK0KN77QEmlSTRFn5Fp7g
//
export function mapzenElevationFcn() {
    return rgbScaleFunction(-32768, 1 / 256)
}
export function mapzenUrl(z, x, y) {
    return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`
}
export const mapzenUrlTemplate =
    'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

// ------------ MapBox
// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/
export function mapboxElevation() {
    return rgbScaleFunction(-10000, 0.1)
}
export function mapboxUrl(z, x, y, token, type = 'terrain-rgb') {
    return `https://api.mapbox.com/v4/mapbox.${type}/${z}/${x}/${y}.png?access_token=${token}`
}

// ------------ RedFish
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

// ============= Simplified Single Tile DataSet Factories =============

// ============= Mapzen
export async function mapzenTile(z, x, y) {
    const tileUrl = mapzenUrl(z, x, y)
    const img = await util.imagePromise(tileUrl)
    return img
}
export function mapzenDataSet(img, ArrayType = Float32Array) {
    const tileDecoder = mapzenElevationFcn()
    return new RGBDataSet(img, tileDecoder, ArrayType)
}

// ============= RedfishUSA
export async function redfishUSATile(z, x, y) {
    const tileUrl = redfishUSAUrl(z, x, y)
    const img = await util.imagePromise(tileUrl)
    return img
}
export function redfishUSADataSet(img, ArrayType = Float32Array) {
    const tileDecoder = redfishElevation
    return new RGBDataSet(img, tileDecoder, ArrayType)
}

// ============= RedfishWorld
export async function redfishWorldDataSet(z, x, y, ArrayType = Float32Array) {
    const tileUrl = redfishWorldUrl(z, x, y)
    const tileDecoder = redfishElevation
    const img = await util.imagePromise(tileUrl)
    return new RGBDataSet(img, tileDecoder, ArrayType)
}

// ============= Mapbox
export async function mapboxDataSet(z, x, y, token, ArrayType = Float32Array) {
    const tileUrl = mapboxUrl(z, x, y, token)
    const tileDecoder = mapboxElevation()
    const img = await util.imagePromise(tileUrl)
    return new RGBDataSet(img, tileDecoder, ArrayType)
}

// ============= Convenience "bundles" =============

export const mapzen = {
    elevationFcn: rgbScaleFunction(-32768, 1 / 256), // returns fcn(r,g,b)
    zxyUrl: (z, x, y) =>
        `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`,
    zxyTemplate:
        'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    maxZoom: 15,

    zxyToTile: async function (z, x, y) {
        const tileUrl = this.zxyUrl(z, x, y)
        const img = await util.imagePromise(tileUrl)
        return img
    },
    zxyToDataSet: async function (z, x, y, ArrayType = Float32Array) {
        const img = await zxyToTile(z, x, y)
        return this.tileDataSet(img, ArrayType)
    },
    tileDataSet: function (img, ArrayType = Float32Array) {
        const tileDecoder = this.elevationFcn()
        return new RGBDataSet(img, tileDecoder, ArrayType)
    },
}

// export async function mapzenTile(z, x, y) {
//     const tileUrl = mapzenUrl(z, x, y)
//     const img = await util.imagePromise(tileUrl)
//     return img
// }
// export function mapzenDataSet(img, ArrayType = Float32Array) {
//     const tileDecoder = mapzenElevationFcn()
//     return new RGBDataSet(img, tileDecoder, ArrayType)
// }
