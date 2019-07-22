import util from './util.js'

export default class PatchesView {
    // Ctor: create a 2D context and imageData for this View
    constructor(width, height) {
        this.ctx = util.createCtx(width, height)
        // this.canvas = this.ctx.canvas
        this.imageData = util.ctxImageData(this.ctx)
        this.pixels = new Uint32Array(this.imageData.data.buffer)
        this.length = this.pixels.length
        this.useImageSmoothing = false
    }
    setPatchesSmoothing(smoothting) {
        this.useImageSmoothing = smoothting
    }

    // Install pixels in this imageData object.
    // pixelFcn(d) returns a pixel for each data item.data can be patches
    // or data derived from patches using patch state values.
    // installData(data, pixelFcn, updateCanvas = true) {
    installData(data, pixelFcn = d => d) {
        if (util.isOofA(data)) data = util.toAofO(data)
        if (data.length !== this.pixels.length) {
            throw Error(
                'installData, data.length != pixels.length ' +
                    data.length +
                    ' ' +
                    this.pixels.length
            )
        }
        util.forLoop(data, (d, i) => {
            this.pixels[i] = pixelFcn(d)
        })

        // if (updateCanvas) this.ctx.putImageData(this.imageData, 0, 0)
    }
    createPixels(pixelFcn) {
        util.repeat(this.length, i => (this.pixels[i] = pixelFcn(i)))
        // if (updateCanvas) this.ctx.putImageData(this.imageData, 0, 0)
    }
    setPixel(x, y, pixel) {
        const index = world.xyToPatchIndex(x, y)
        this.pixels[index] = pixel
    }

    // Draw this pixel canvas onto a View 2D canvas ctx.
    draw(ctx) {
        const smoothing = this.ctx.imageSmoothingEnabled
        ctx.imageSmoothingEnabled = this.useImageSmoothing
        this.ctx.putImageData(this.imageData, 0, 0)
        // this.updateCanvas()
        util.fillCtxWithImage(ctx, this.ctx.canvas)
        ctx.imageSmoothingEnabled = smoothing
    }

    // Return promise for an imageBitmap of the current ctx
    // REMIND: See if imagebitmaps can avoid img alpha premultiply etc
    getImageBitmap(options = {}) {
        return createImageBitmap(this.imageData, options)
    }
    drawImageBitmap(ctx, options = {}) {
        createImageBitmap(this.imageData, options).then(img =>
            util.fillCtxWithImage(ctx, img)
        )
    }

    // Push imageData to canvas, return the canvas
    updateCanvas() {
        this.ctx.putImageData(this.imageData, 0, 0)
        return this.ctx.canvas
    }
}
