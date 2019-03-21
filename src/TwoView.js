import util from './util.js'
import World from './World.js'
import PatchesView from './PatchesView.js'
import TurtlesView from './TurtlesView.js'

export default class View2d {
    static defaultOptions() {
        const options = {
            // canvasStack: false,
            useSprites: false,
            patchSize: 10,
        }
        return options
    }

    // ======================

    constructor(
        div = document.body,
        worldOptions = World.defaultOptions(),
        options = View2d.defaultOptions()
    ) {
        div = util.isString(div) ? document.getElementById(div) : div
        if (!util.isCanvas(div)) {
            const can = util.createCanvas(0, 0, false) // not offscreen
            div.appendChild(can)
            div = can
        }
        const ctx = div.getContext('2d')
        const world = new World(worldOptions)
        // override defaults:
        options = Object.assign(View2d.defaultOptions(), options)
        // Object.assign(this, { ctx, world }, options)
        Object.assign(this, { ctx, world })

        this.patchesView = new PatchesView(world.width, world.height)
        this.turtlesView = new TurtlesView(
            ctx,
            options.patchSize,
            world,
            options.useSprites
        )

        // this.viewFcns = {}
        // this.steps = 0
    }
    reset(patchSize, useSprites = this.useSprites) {
        this.turtlesView.reset(patchSize, useSprites)
    }
    get patchSize() {
        return this.turtlesView.patchSize
    }
    get useSprites() {
        return this.turtlesView.useSprites
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

    // installViewFcns(viewFcns) {
    //     this.viewFcns = viewFcns
    // }
    // draw()
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
//     this.turtlesViewData = util.forEach(data, (d, i, array))
// }
