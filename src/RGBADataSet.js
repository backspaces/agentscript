import util from './util.js'
import DataSet from './DataSet.js'

// Parse an RGBA image to a DataSet of the given type.
// We use all 4 bytes of the pixels, thus map exactly onto
// multiples all [TypedArray](https://goo.gl/3OOQzy) sizes.
class RGBADataSet extends DataSet {
  constructor (img, Type = Float32Array, options = {}) {
    const bytes = util.imageToBytes(img)
    const data = new Type(bytes.buffer) // Parse via a Type view on the buffer
    const dataPerPixel = 4 * data.length / bytes.length
    const width = dataPerPixel * img.width
    const height = img.height
    super(width, height, data)
    Object.assign(this, options)
    this.src = img.src
  }
}

export default RGBADataSet
