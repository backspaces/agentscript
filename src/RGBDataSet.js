import * as util from './utils.js'
import DataSet from './DataSet.js'

// See TileData.js for several rgbToData functions
// as well as their use with several tile servers

export default class RGBDataSet extends DataSet {
    static rgbToInt24(r, g, b) {
        return r * 256 * 256 + g * 256 + b
    }

    // Constructor args: (img, rgbToData, ArrayType)
    // where rgbToData(r,g,b) returns a number for the dataset.
    constructor(
        img,
        rgbToData = RGBDataSet.rgbToInt24,
        ArrayType = Float32Array
    ) {
        super(img.width, img.height, new ArrayType(img.width * img.height))

        if (Array.isArray(rgbToData))
            rgbToData = RGBDataSet.newRgbDataFunction(rgbToData)

        // const ctx = util.createCtx(img.width, img.height)
        // util.fillCtxWithImage(ctx, img)
        const ctx = util.imageToCtx(img)
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
