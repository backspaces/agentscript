import * as util from './utils.js'
import RGBDataSet from './RGBDataSet.js'
import GeoDataSet from './GeoDataSet.js'
import { xyz2bbox } from './gis.js'

// ============= rgb to elevation/numeric =============

function rgbToInt24(r, g, b) {
    return r * 256 * 256 + g * 256 + b
}
function rgbScaleFunction(min, scale) {
    return (r, g, b) => min + rgbToInt24(r, g, b) * scale
}
function redfishElevation(r, g, b) {
    let negative = 1 // From RGB2DeciMeters()
    if (r > 63) {
        negative = -1
        r = 0
    }
    return (negative * rgbToInt24(r, g, b)) / 10
}

// ============= Convenience elevation "bundles" =============
// Example use:
// import { mapzen as provider } from '../src/TileData.js'

const sharedTileObject = {
    zxyToTile: async function (z, x, y) {
        const tileUrl = this.zxyUrl(z, x, y)
        const img = await util.imagePromise(tileUrl)
        img.zxy = [z, x, y]
        return img
    },
    zxyToDataSet: async function (z, x, y, ArrayType = Float32Array) {
        const img = await this.zxyToTile(z, x, y)
        const dataSet = this.tileDataSet(img, ArrayType)
        const bbox = xyz2bbox(x, y, z)
        const geoDS = GeoDataSet.viewFromDataSet(dataSet, bbox)
        geoDS.zxy = [z, x, y]
        // dataSet.img = img
        return geoDS
    },
    tileDataSet: function (img, ArrayType = Float32Array) {
        const tileDecoder = this.elevationFcn
        return new RGBDataSet(img, tileDecoder, ArrayType)
    },
    tileSize: 256,
}

export const maptiler = Object.assign(
    {
        elevationFcn: rgbScaleFunction(-10000, 0.1),
        zxyUrl: (z, x, y) =>
            `https://api.maptiler.com/tiles/terrain-rgb/${z}/${x}/${y}.png?key=iQurAP6lArV1UP4gfSVs`,
        zxyTemplate:
            'https://api.maptiler.com/tiles/terrain-rgb/{z}/{x}/{y}.png?key=iQurAP6lArV1UP4gfSVs',
        minZoom: 0,
        maxZoom: 15,
    },
    sharedTileObject
)

export const mapzen = Object.assign(
    {
        elevationFcn: rgbScaleFunction(-32768, 1 / 256), // returns fcn(r,g,b)
        zxyUrl: (z, x, y) =>
            `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`,
        zxyTemplate:
            'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
        minZoom: 0,
        maxZoom: 15,
    },
    sharedTileObject
)

export const redfishUSA = Object.assign(
    {
        elevationFcn: redfishElevation,
        zxyUrl: (z, x, y) =>
            `https://s3-us-west-2.amazonaws.com/simtable-elevation-tiles/${z}/${x}/${y}.png`,
        zxyTemplate:
            'https://s3-us-west-2.amazonaws.com/simtable-elevation-tiles/{z}/{x}/{y}.png',
        minZoom: 10,
        maxZoom: 14,
    },
    sharedTileObject
)

export const redfishWorld = Object.assign(
    {
        elevationFcn: redfishElevation,
        zxyUrl: (z, x, y) =>
            `https://s3-us-west-2.amazonaws.com/world-elevation-tiles/DEM_tiles/${z}/${x}/${y}.png`,
        zxyTemplate:
            'https://s3-us-west-2.amazonaws.com/world-elevation-tiles/DEM_tiles/{z}/{x}/{y}.png',
        minZoom: 7,
        maxZoom: 13,
    },
    sharedTileObject
)

// https://docs.mapbox.com/data/tilesets/guides/access-elevation-data/
const mapboxToken =
    'pk.eyJ1IjoiYmFja3NwYWNlcyIsImEiOiJjanVrbzI4dncwOXl3M3ptcGJtN3oxMmhoIn0.x9iSCrtm0iADEqixVgPwqQ'
export const mapbox = Object.assign(
    {
        elevationFcn: rgbScaleFunction(-10000, 0.1),
        zxyUrl: (z, x, y) =>
            `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.png?access_token=` +
            mapboxToken,
        zxyTemplate:
            'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=' +
            mapboxToken,
        minZoom: 0,
        maxZoom: 18,
    },
    sharedTileObject
)

// if your're using mapbox, consider the open source maplibre
// maplibre can use mapzen for it's tiles.
export const maplibre = mapzen
