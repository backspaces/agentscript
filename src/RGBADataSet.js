import * as util from '../src/utils.js'
import DataSet from './DataSet.js'

// Parse an RGBA image to a DataSet of the given type.
// We use all 4 bytes of the pixels, thus map exactly onto
// multiples all [TypedArray](https://goo.gl/3OOQzy) sizes.
class RGBADataSet extends DataSet {
    constructor(img, Type = Float32Array, options = {}) {
        const bytes = imageToBytes(img)
        const data = new Type(bytes.buffer) // Parse via a Type view on the buffer
        const dataPerPixel = (4 * data.length) / bytes.length
        const width = dataPerPixel * img.width
        const height = img.height
        super(width, height, data)
        Object.assign(this, options)
        this.src = img.src
    }
}
// Use webgl texture to convert img to Uint8Array w/o alpha premultiply
// or color profile modification.
// Img can be Image, ImageData, Canvas: [See MDN](https://goo.gl/a3oyRA).
// `flipY` is used to invert image to upright.
// REMIND: use webgl12 if it works .. allows all imagables, not just Image.
// REMIND: use imagebitmap when available in safari!
// https://dev.to/nektro/createimagebitmap-polyfill-for-safari-and-edge-228
let imageToBytesCtx = null
export function imageToBytes(img, flipY = false, imgFormat = 'RGBA') {
    // Create the gl context using the image width and height
    if (!imageToBytesCtx) {
        const can = util.createCanvas(0, 0)
        imageToBytesCtx = can.getContext('webgl', {
            premultipliedAlpha: false,
        })
    }

    const { width, height } = img
    const gl = imageToBytesCtx
    Object.assign(gl.canvas, { width, height })
    const fmt = gl[imgFormat]

    // Create and initialize the texture.
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    if (flipY) {
        // Mainly used for pictures rather than data
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    }
    // Insure [no color profile applied](https://goo.gl/BzBVJ9):
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
    // Insure no [alpha premultiply](http://goo.gl/mejNCK).
    // False is the default, but lets make sure!
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)

    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, img)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

    // Create the framebuffer used for the texture
    const framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    )

    // See if it all worked. Apparently not async.
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        throw Error(`imageToBytes: status not FRAMEBUFFER_COMPLETE: ${status}`)
    }

    // If all OK, create the pixels buffer and read data.
    const pixSize = imgFormat === 'RGB' ? 3 : 4
    const pixels = new Uint8Array(pixSize * width * height)
    // gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    gl.readPixels(0, 0, width, height, fmt, gl.UNSIGNED_BYTE, pixels)

    // Unbind the framebuffer and return pixels
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return pixels
}

export default RGBADataSet
