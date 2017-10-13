import util from './util.js'
import DataSet from './DataSet.js'

class RGBDataSet extends DataSet {
  static scaleFromMinMax (min, max) {
    // 255*256*256 + 255*256 + 255 === 2 ** 24 - 1 i.e. 16777215
    return (max - min) / (2 ** 24 - 1)
  }

  constructor (img, min = 0, scale = 1) { // options = {}) {
    super(img.width, img.height, new Float32Array(img.width * img.height))
    // Object.assign(this, options)
    const ctx = util.createCtx(img.width, img.height)
    util.fillCtxWithImage(ctx, img)
    const imgData = util.ctxImageData(ctx)
    const convertedData = this.data // new Float32Array(img.width * img.height)
    for (var i = 0; i < convertedData.length; i++) {
      const r = imgData.data[4 * i]
      const g = imgData.data[4 * i + 1]
      const b = imgData.data[4 * i + 2]
      convertedData[i] = min + ((r * 256 * 256 + g * 256 + b) * scale)
    }
    // this.src = img.src // Might be useful? Flags as image data set.
  }

  // Convert RGB to a number.
  // https://blog.mapbox.com/global-elevation-data-6689f1d0ba65
  // height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
  // by default this assumes the values are in decimeters,
  // but it can be overwritten.
  // This funnction gets called in a tight loop for every pixel.
  // rgb2Number (r, g, b, floor = -10000, scale = 0.1) {
  //   return floor + ((r * 256 * 256 + g * 256 + b) * scale)
  // }
}

export default RGBDataSet
