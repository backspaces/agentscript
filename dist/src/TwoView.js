import * as util from './utils.js'
import World from './World.js'
import PatchesView from './PatchesView.js'
import TurtlesView from './TurtlesView.js'

export default class TwoView {
    static defaultOptions() {
        return {
            div: document.body,
            useSprites: false,
            patchSize: 10,
        }
    }

    // ======================

    // Note: world can be a model, who'd model.world will be used
    constructor(world, options = {}) {
        // options: override defaults, assign to this
        Object.assign(this, TwoView.defaultOptions(), options)

        let div = this.div
        div = util.isString(div) ? document.getElementById(div) : div
        if (!util.isCanvas(div)) {
            const can = util.createCanvas(0, 0, false) // not offscreen
            div.appendChild(can)
            div = can
        }
        // this.div = div

        this.ctx = div.getContext('2d')
        this.world = new World(world.world || world) // world can be model

        // Object.assign(this, { ctx, world }, options)
        // Object.assign(this, { ctx, world })

        this.patchesView = new PatchesView(this.world.width, this.world.height)
        this.turtlesView = new TurtlesView(this.ctx, this.world, options)

        this.ticks = 0
        this.clear()
    }
    tick() {
        this.ticks++
    }
    get canvas() {
        return this.ctx.canvas
    }
    reset(patchSize, useSprites = this.useSprites) {
        this.patchSize = patchSize
        this.useSprites = useSprites
        this.turtlesView.reset(patchSize, useSprites)
    }

    // Oops! Already variable names:
    // get patchSize() {
    //     return this.turtlesView.patchSize
    // }
    // set patchSize(val) {
    //     this.reset(val)
    // }
    // get useSprites() {
    //     return this.turtlesView.useSprites
    // }
    // set useSprites(val) {
    //     this.reset(this.patchSize, val)
    // }

    // Clear the view.canvas.
    // If no color, or 'transparent', make transparent via clearCtx.
    // If cssColor.css (typedColor) use it, else cssColor
    clear(cssColor) {
        util.clearCtx(this.ctx, cssColor)

        // REMIND: Clear the pixels?
        // this.patchesView.clear(cssColor)
    }

    createPatchPixels(pixelFcn) {
        this.patchesView.createPixels(pixelFcn)
    }
    // setPatchPixel(x, y, pixel) {
    //     this.patchesView.setPixel(x, y, pixel)
    // }
    setPatchPixel(index, pixel) {
        this.patchesView.setPixel(index, pixel)
    }
    setPatchesPixels(data, pixelFcn) {
        this.patchesView.setPixels(data, pixelFcn)
    }
    setPatchesSmoothing(smoothing) {
        this.patchesView.setPatchesSmoothing(smoothing)
    }
    drawPatchesImage(img) {
        // if (img) util.fillCtxWithImage(this.ctx, img) ??
        util.fillCtxWithImage(this.ctx, img)
    }

    // If no data, redraw with existing patchesView cache
    drawPatches(data, pixelFcn) {
        if (data != null) {
            this.patchesView.setPixels(data, pixelFcn)
        }
        this.patchesView.draw(this.ctx)
    }

    drawTurtles(data, viewFcn) {
        this.turtlesView.drawTurtles(data, viewFcn)
    }

    drawLinks(data, viewFcn) {
        this.turtlesView.drawLinks(data, viewFcn)
    }

    setTextProperties(font, textAlign = 'center', textBaseline = 'middle') {
        if (typeof font === 'number')
            font = `${this.patchSize * font}px sans-serif`
        util.setTextProperties(this.ctx, font, textAlign, textBaseline)
    }
    drawText(string, x, y, color = 'black') {
        ;[x, y] = this.world.patchXYtoPixelXY(x, y, this.patchSize)
        string = '' + string // convert numeric values to strings
        util.drawText(this.ctx, string, x, y, color)
    }
}
