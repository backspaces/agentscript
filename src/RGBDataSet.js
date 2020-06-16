import util from './util.js'
import DataSet from './DataSet.js'

// The mapbox elevation formula:
// https://blog.mapbox.com/global-elevation-data-6689f1d0ba65
// mapbox: ((red * 256 * 256 + green * 256 + blue) * 0.1)  -10000
//      min = -10000; scale = 0.1
// mapzen/amazon: (red * 256 + green + blue / 256) - 32768
//      min = -32768; scale = 1/256

class RGBDataSet extends DataSet {
    static newRgbDataFunction(min, scale) {
        return (r, g, b) => min + (r * 256 * 256 + g * 256 + b) * scale
    }

    // amazon/mapzen: https://registry.opendata.aws/tag/elevation/
    static newMapzenElevation() {
        return this.newRgbDataFunction(-32768, 1 / 256)
    }
    static mapzenUrl(z, x, y) {
        return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`
    }
    // https://docs.mapbox.com/help/troubleshooting/access-elevation-data/
    static newMapboxElevation() {
        return this.newRgbDataFunction(-10000, 0.1)
    }
    static mapboxUrl(z, x, y, token) {
        return `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${token}`
    }

    static redfishElevation(r, g, b) {
        let negative = 1 // From RGB2DeciMeters()
        if (r > 63) {
            negative = -1
            r = 0
        }
        return (negative * (r * 256 * 256 + g * 256 + b)) / 10
    }
    static redfishUSAUrl(z, x, y) {
        return `https://s3-us-west-2.amazonaws.com/simtable-elevation-tiles/${z}/${x}/${y}.png`
    }
    static redfishWorldUrl(z, x, y) {
        return `https://s3-us-west-2.amazonaws.com/world-elevation-tiles/DEM_tiles/${z}/${x}/${y}.png`
    }

    static rgbToInt24(r, g, b) {
        return r * 256 * 256 + g * 256 + b
    }

    // Constructor args: (img, rgbToData, ArrayType)
    // where rgbToData(r,g,b) returns a number for the dataset.
    // For Redfish tiles, use
    //   new RGBDataSet(img, RGBDataSet.redfishElevation)
    // For Mapzen use
    //   new RGBDataSet(img, RGBDataSet.newMapzenElevation())
    // which constructs the r,g,b function from the mapzen min, scale values.
    // Similarly for mapbox using a min, scale function.
    constructor(
        img,
        rgbToData = RGBDataSet.rgbToInt24,
        ArrayType = Float32Array
    ) {
        super(img.width, img.height, new ArrayType(img.width * img.height))

        if (Array.isArray(rgbToData))
            rgbToData = RGBDataSet.newRgbDataFunction(rgbToData)

        const ctx = util.createCtx(img.width, img.height)
        util.fillCtxWithImage(ctx, img)
        const imgData = util.ctxImageData(ctx)

        const convertedData = this.data
        for (var i = 0; i < convertedData.length; i++) {
            const r = imgData.data[4 * i]
            const g = imgData.data[4 * i + 1]
            const b = imgData.data[4 * i + 2]
            convertedData[i] = rgbToData(r, g, b)
        }
    }
}

export default RGBDataSet
