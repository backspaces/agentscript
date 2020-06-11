import util from './util.js'
import DataSet from './DataSet.js'

// The mapbox elevation formula:
// https://blog.mapbox.com/global-elevation-data-6689f1d0ba65
// mapbox: ((red * 256 * 256 + green * 256 + blue) * 0.1)  -10000
//      min = -10000; scale = 0.1
// mapzen/amazon: (red * 256 + green + blue / 256) - 32768
//      min = -32768; scale = 1/256

class RGBDataSet extends DataSet {
    // static scaleFromMinMax(min, max) {
    //     // 255*256*256 + 255*256 + 255 === 2 ** 24 - 1 i.e. 16777215
    //     return (max - min) / (2 ** 24 - 1)
    // }
    static newRgbDataFunction(min, scale) {
        return (r, g, b) => min + (r * 256 * 256 + g * 256 + b) * scale
    }
    static newMapzenElevation() {
        return this.newRgbDataFunction(-32768, 1 / 256)
    }
    static newMapboxElevation() {
        return this.newRgbDataFunction(-10000, 0.1)
    }

    static rgbToInt24(r, g, b) {
        return r * 256 * 256 + g * 256 + b
    }
    static redfishElevation(r, g, b) {
        let negative = 1 // From RGB2DeciMeters()
        if (r > 63) {
            negative = -1
            r = 0
        }
        return (negative * (r * 256 * 256 + g * 256 + b)) / 10
    }
    // Constructor args: (img, rgbToData, ArrayType)
    // where rgbToData(r,g,b) returns a number for the dataset.
    // For Redfish tiles, use
    //   new RGBDataSet(img, RGBDataSet.redfishElevation)
    // For Mapzen use
    //   new RGBDataSet(img, RGBDataSet.newMapzenElevation())
    // which constructs the r,g,b function from the mapzen min, scale values.
    constructor(
        img,
        rgbToData = RGBDataSet.rgbToInt24,
        ArrayType = Float32Array
    ) {
        super(img.width, img.height, new ArrayType(img.width * img.height))
        // if (typeof min === 'function') {
        //     ArrayType = scale === 1 ? Float32Array : scale
        //     fcn = min
        // }
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
            // value = min + int24 * scale
            convertedData[i] = rgbToData(r, g, b)
            // convertedData[i] = min
            //     ? min + (r * 256 * 256 + g * 256 + b) * scale
            //     : rgbToData(r, g, b)
        }
    }
}

export default RGBDataSet
