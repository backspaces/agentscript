import * as util from './utils.js'
import Color from './Color.js'

// const getPixel = color => color.pixel || color
function getPixel(color) {
    // if (typeof pixel === 'number') return pixel
    if (typeof color === 'number') return color
    if (color.pixel) return color.pixel
    if (color === 'transparent') return 0 // 'rgba(0,0,0,0)'
    return Color.toTypedColor(color).pixel
}

class PatchesView {
    // Ctor: create a 2D context and imageData for this View
    constructor(width, height) {
        this.ctx = util.createCtx(width, height)
        this.resetImageData()
        // this.imageData = util.ctxImageData(this.ctx)
        // this.pixels = new Uint32Array(this.imageData.data.buffer)
        // this.length = this.pixels.length
        this.useImageSmoothing = false
    }
    // Set the imageData and pixels values from the pixel's canvas ctx
    resetImageData() {
        this.imageData = util.ctxImageData(this.ctx)
        this.pixels = new Uint32Array(this.imageData.data.buffer)
        // this.length = this.pixels.length
    }
    setPatchesSmoothing(smoothting) {
        this.useImageSmoothing = smoothting
    }

    // Install pixels in this imageData object.
    // pixelFcn(d) returns a pixel for each data item.data can be patches
    // or data derived from patches using patch state values.
    setPixels(data, pixelFcn = d => d) {
        if (util.isOofA(data)) data = util.toAofO(data)
        if (data.length !== this.pixels.length) {
            throw Error(
                'setPixels, data.length != pixels.length ' +
                    data.length +
                    ' ' +
                    this.pixels.length
            )
        }
        util.forLoop(data, (d, i) => {
            this.pixels[i] = getPixel(pixelFcn(d))
        })

        // if (updateCanvas) this.ctx.putImageData(this.imageData, 0, 0)
    }
    createPixels(pixelFcn) {
        util.repeat(this.pixels.length, i => {
            this.pixels[i] = getPixel(pixelFcn(i))
        })
        // if (updateCanvas) this.ctx.putImageData(this.imageData, 0, 0)
    }
    // Used to be: setPixel(x, y, pixel) {
    // but best to be purely independent of world object
    setPixel(index, pixel) {
        // const index = world.xyToPatchIndex(x, y)
        this.pixels[index] = getPixel(pixel)
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
    clear(color) {
        // typedColor -> css
        color = color.css || color

        if (!color || typeof color === 'string') {
            util.clearCtx(this.ctx, color)
        } else if (typeof color === 'number') {
            this.createPixels(() => color)
        } else {
            throw Error('patchesView.clear(): illegal color ' + color)
        }

        if (typeof color === 'number') {
            this.updateCanvas()
        } else {
            this.resetImageData()
        }
    }

    // Return promise for an ImageBitmap of the current ctx
    // Note safari does not support createImageBitmap as of 4/20/19
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

export default PatchesView
