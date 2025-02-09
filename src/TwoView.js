import * as util from './utils.js'
import PatchesView from './PatchesView.js'
import TurtlesView from './TurtlesView.js'

class TwoView {
    static defaultOptions() {
        return {
            // div: document.body,
            div: 'modelDiv',
            useSprites: false,
            patchSize: 10,
            // width: null,
        }
    }

    // ======================

    // Note: world can be a model, who's model.world will be used
    constructor(world, options = {}) {
        // if world is a model:
        if (world.world) world = world.world

        // options: override defaults, assign to this
        // Object.assign(this, TwoView.defaultOptions(), options)
        options = Object.assign(TwoView.defaultOptions(), options)
        if (options.width) {
            options.patchSize = options.width / world.numX
            delete options.width
        }

        let div = options.div
        div = util.isString(div) ? document.getElementById(div) : div

        const children = Array.from(div.children)
        const canvases = children.filter(child => util.isCanvas(child))
        console.log('div children: ', children, ' canvases', canvases)
        // util.toWindow({ children, canvases })

        let can
        // if (children.length === 0) {
        if (canvases.length === 0) {
            can = util.createCanvas(0, 0, true) // not offscreen, preferDOM
            div.appendChild(can)
        } else {
            can = div.firstChild
        }

        this.ctx = can.getContext('2d')
        this.world = world

        this.patchesView = new PatchesView(this.world.numX, this.world.numY)
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
    // setPatchSize(patchSize) {
    //     this.reset(patchSize)
    // }
    // setWidth(width) {
    //     this.reset(width / this.world.numX)
    // }
    // get patchSize() {
    //     this.turtlesView.patchSize
    // }
    reset(patchSize, useSprites = this.useSprites) {
        this.turtlesView.reset(patchSize, useSprites)
    }

    // name need not end ".png", will be added if needed.
    // if name undefined use model name, lowerCase'd w/ "Model" removed
    downloadCanvas(width = undefined, height = undefined, name = undefined) {
        let can = this.canvas
        if (!name)
            name = this.model.constructor.name
                .toLowerCase()
                .replace(/model$/, '')
        if (width && height) {
            can = document.createElement('canvas')
            can.width = width
            can.height = height
            const ctx = can.getContext('2d')
            ctx.drawImage(this.canvas, 0, 0, width, height)
        }
        util.downloadCanvas(can, name)
    }

    get width() {
        // return this.world.numX * this.turtlesView.patchSize // this.patchSize
        return this.world.numX * this.patchSize
    }
    set width(val) {
        this.reset(val / this.world.numX)
    }
    get patchSize() {
        return this.turtlesView.patchSize
    }
    set patchSize(val) {
        this.reset(val)
    }
    get useSprites() {
        return this.turtlesView.useSprites
    }
    set useSprites(val) {
        this.reset(this.patchSize, val)
    }

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

export default TwoView
