import util from '../src/util.js'

// The shared 1x1 canvas 2D context.
const sharedCtx1x1 = util.createCtx(1, 1)

export default class PatchesView {
    // Pixel utilities
    static rgbaToPixel(r, g, b, a = 255) {
        const rgba = new Uint8Array([r, g, b, a])
        const pixels = new Uint32Array(rgba.buffer)
        return pixels[0]
    }
    static randomPixel() {
        const r255 = () => util.randomInt(256) // random int in [0,255]
        return this.rgbaToPixel(r255(), r255(), r255())
    }
    static cssToPixel(string) {
        sharedCtx1x1.clearRect(0, 0, 1, 1)
        sharedCtx1x1.fillStyle = string
        sharedCtx1x1.fillRect(0, 0, 1, 1)
        const rgba = sharedCtx1x1.getImageData(0, 0, 1, 1).data
        return this.rgbaToPixel(...rgba)
    }

    // ------------------------------

    // Ctor: create a 2D context and imageData for this View
    constructor(width, height) {
        this.ctx = util.createCtx(width, height)
        this.imageData = util.ctxImageData(this.ctx)
        this.pixels = new Uint32Array(this.imageData.data.buffer)
    }

    // Install pixels in this imageData object.
    // pixelFcn(d) returns a pixel for each data item.data can be patches
    // or data derived from patches using patch state values.
    installPixels(data, pixelFcn) {
        if (data.length != this.pixels.length) {
            throw Error(
                'installPixels, data.length != pixels.length ' +
                    data.length +
                    ' ' +
                    this.pixels.length
            )
        }
        util.forEach(data, (d, i) => {
            this.pixels[i] = pixelFcn(d)
        })
    }

    // Draw this pixel canvas onto a View canvas ctx.
    draw(ctx, async = false) {
        if (async) {
            this.getImageBitmap().then(img => util.fillCtxWithImage(ctx, img))
        } else {
            this.ctx.putImageData(this.imageData, 0, 0)
            util.fillCtxWithImage(ctx, this.ctx.canvas)
        }
    }

    // Return promise for an imageBitmap of the current ctx
    getImageBitmap() {
        return createImageBitmap(this.imageData)
    }
}
