import util from './util.js'
import DataSet from './DataSet.js'

// The mapbox elevation formula:
// https://blog.mapbox.com/global-elevation-data-6689f1d0ba65
// mapbox: ((red * 256 * 256 + green * 256 + blue) * 0.1)  -10000
//      min = -10000; scale = 0.1
// Amazon/Terrarium: (red * 256 + green + blue / 256) - 32768
//      min = -32768; scale = 1/256

class RGBDataSet extends DataSet {
    static scaleFromMinMax(min, max) {
        // 255*256*256 + 255*256 + 255 === 2 ** 24 - 1 i.e. 16777215
        return (max - min) / (2 ** 24 - 1)
    }
    static redfishRGBFcn(r, g, b) {
        // From RGB2DeciMeters()
        let negative = 1
        if (r > 63) {
            negative = -1
            r = 0
        }
        return (negative * (r * 256 * 256 + g * 256 + b)) / 10
    }

    // Default ctor uses scale like above.
    // If min is a function, ctor is: (img, fcn, ArrayType)
    // where fcn(r,g,b) returns a number for the dataset.
    // For Redfish tiles, use
    //   new RGBDataSet(img, RGBDataSet.redfishRGBFcn, ArrayType = Float32Array)
    constructor(img, min = 0, scale = 1, ArrayType = Float32Array) {
        let fcn
        if (typeof min === 'function') {
            ArrayType = scale === 1 ? Float32Array : scale
            fcn = min
        }
        super(img.width, img.height, new ArrayType(img.width * img.height))
        const ctx = util.createCtx(img.width, img.height)
        util.fillCtxWithImage(ctx, img)
        const imgData = util.ctxImageData(ctx)
        const convertedData = this.data
        for (var i = 0; i < convertedData.length; i++) {
            const r = imgData.data[4 * i]
            const g = imgData.data[4 * i + 1]
            const b = imgData.data[4 * i + 2]
            // value = min + int24 * scale
            convertedData[i] = fcn
                ? fcn(r, g, b)
                : min + (r * 256 * 256 + g * 256 + b) * scale
        }
    }
}

export default RGBDataSet
