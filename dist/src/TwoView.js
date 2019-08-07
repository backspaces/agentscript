import util from './util.js'
import World from './World.js'
import PatchesView from './PatchesView.js'
import TurtlesView from './TurtlesView.js'

export default class TwoView {
    static defaultOptions() {
        return TurtlesView.defaultOptions()
    }

    // ======================

    constructor(
        div = document.body,
        worldOptions = World.defaultOptions(),
        options = {} // TwoView.defaultOptions()
    ) {
        // options: override defaults:
        options = Object.assign(TwoView.defaultOptions(), options)

        div = util.isString(div) ? document.getElementById(div) : div
        if (!util.isCanvas(div)) {
            const can = util.createCanvas(0, 0, false) // not offscreen
            div.appendChild(can)
            div = can
        }

        const ctx = div.getContext('2d')
        const world = new World(worldOptions)

        // Object.assign(this, { ctx, world }, options)
        Object.assign(this, { ctx, world })

        this.patchesView = new PatchesView(world.width, world.height)
        this.turtlesView = new TurtlesView(ctx, world, options)

        this.ticks = 0
    }
    tick() {
        this.ticks++
    }
    get canvas() {
        return this.ctx.canvas
    }
    reset(patchSize, useSprites = this.useSprites) {
        this.turtlesView.reset(patchSize, useSprites)
    }

    get patchSize() {
        return this.turtlesView.patchSize
    }
    set patchSize(val) {
        this.reset(val, this.useSprites)
    }
    get useSprites() {
        return this.turtlesView.useSprites
    }
    set useSprites(val) {
        this.reset(this.patchSize, val)
    }

    clear(cssColor = null) {
        if (cssColor) {
            util.fillCtx(this.ctx, cssColor)
        } else {
            util.clearCtx(this.ctx)
        }
    }

    installPatchPixels(data, pixelFcn) {
        this.patchesView.installData(data, pixelFcn)
    }
    createPatchPixels(pixelFcn) {
        this.patchesView.createPixels(pixelFcn)
    }
    setPatchPixel(x, y, pixel) {
        this.patchesView.setPixel(x, y, pixel)
    }
    setPatchesSmoothing(smoothing) {
        this.patchesView.setPatchesSmoothing(smoothing)
    }

    // If no data, redraw with existing patchesView cache
    drawPatches(data, pixelFcn) {
        if (data != null) {
            this.patchesView.installData(data, pixelFcn)
        }
        this.patchesView.draw(this.ctx)
    }

    drawTurtles(data, viewFcn) {
        this.turtlesView.drawTurtles(data, viewFcn)
    }

    drawLinks(data, viewFcn) {
        this.turtlesView.drawLinks(data, viewFcn)
    }
}

// draw() {
//     // patches:
//     if (this.clearColor != null) util.clearCtx(this.ctx)
//     else this.redrawPatches()
//     // links:
// }

// installTurtles(data, viewFcn) {
//     this.staticTurtles = true
//     this.turtleViewData = util.isObject(viewFcn)
//         ? viewFcn
//         : this.turtlesView.installData(data, viewFcn)
// }

// redrawPatches() {
//     const smoothing = this.ctx.imageSmoothingEnabled
//     this.ctx.imageSmoothingEnabled = false
//     this.patchesView.draw(this.ctx)
//     this.ctx.imageSmoothingEnabled = smoothing
// }

// installTurtlesViewData(data, pixelFcn) {
//     this.turtlesViewData = util.forLoop(data, (d, i, array))
// }
