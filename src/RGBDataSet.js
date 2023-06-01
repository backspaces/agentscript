import * as util from './utils.js'
import DataSet from './DataSet.js'

// See TileData.js for several rgbToData functions
// as well as their use with several tile servers

/**
 * Class for converting an image to a DataSet.
 *
 * @class
 * @extends DataSet
 */
class RGBDataSet extends DataSet {
    /**
     * Convert an r,g,b triple into an integer
     * @param {number} r Red value, integer in [0,255]
     * @param {number} g Green value, integer in [0,255]
     * @param {number} b Blue value, integer in [0,255]
     * @returns {number} A 24 bit integer
     */
    static rgbToInt24(r, g, b) {
        return r * 256 * 256 + g * 256 + b
    }

    /**
     * As above with min/scale
     * @param {number} min The min return value
     * @param {number} scale The scale factor
     * @returns {number} A 24 bit integer
     */
    static rgbScaleFunction(min, scale) {
        return (r, g, b) => min + rgbToInt24(r, g, b) * scale
        // return (r, g, b) => min + (r * 256 * 256 + g * 256 + b) * scale
    }

    // Constructor args: (img, rgbToData, ArrayType)
    // where rgbToData(r,g,b) returns a number for the dataset.
    /**
     * Create a {@link DataSet} from image pixel data
     * @param {Image} img Any "imagable" object that can be drawn to a canvas
     * @param {function} rgbToData Fnction converting 3 r,g,b bytes to a number
     * @param {constructor} ArrayType A TypedArray or Array. (default Float32)
     */
    constructor(
        img,
        rgbToData = RGBDataSet.rgbToInt24,
        ArrayType = Float32Array
    ) {
        // const [width, height] = util.imageSize(img)
        const { width, height } = img
        super(width, height, new ArrayType(width * height))
        // super(img.width, img.height, new ArrayType(img.width * img.height))

        // Not used or defined anywhere!
        // if (Array.isArray(rgbToData))
        //     rgbToData = RGBDataSet.newRgbDataFunction(rgbToData)

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

export default RGBDataSet
