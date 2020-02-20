import util from './util.js'
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

    // get patchSize() {
    //     return this.turtlesView.patchSize
    // }
    // set patchSize(val) {
    //     this.reset(val, this.useSprites)
    // }
    // get useSprites() {
    //     return this.turtlesView.useSprites
    // }
    // set useSprites(val) {
    //     this.reset(this.patchSize, val)
    // }

    clear(cssColor = null) {
        if (cssColor) {
            util.fillCtx(this.ctx, cssColor)
        } else {
            util.clearCtx(this.ctx)
        }
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
        if (img) util.fillCtxWithImage(this.ctx, img)
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
//         : this.turtlesView.setPixels(data, viewFcn)
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
