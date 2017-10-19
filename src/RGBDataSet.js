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
}

export default RGBDataSet
