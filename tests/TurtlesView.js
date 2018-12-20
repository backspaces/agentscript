import util from '../src/util.js'

// The shared 1x1 canvas 2D context.
const sharedCtx1x1 = util.createCtx(1, 1)

export default class TurtlesView {
    // Ctor: create a 2D context and imageData for this View
    constructor(width, height) {
        this.ctx = util.createCtx(width, height)
        // this.imageData = util.ctxImageData(this.ctx)
        // this.pixels = new Uint32Array(this.imageData.data.buffer)
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
