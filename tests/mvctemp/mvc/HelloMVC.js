import HelloModel from '../models/HelloModel.js'
import ThreeMVC from '../src/ThreeMVC.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import World from '../src/World.js'

export default class HelloMVC extends ThreeMVC {
    static defaultOptions() {
        return {
            // Model defaults, you can override here:
            // population: 10,
            // speed: 0.1,
            // wiggle: 0.1,
            // world: World.defaultOptions(20),
            world: World.defaultOptions(25),
            population: 1000,

            // ThreeMVC defaults, you can override here:
            // div: document.body,
            // useSprites: false,
            // patchSize: 10,
            useSprites: true,
            patchSize: 15,

            // View parameters, used by draw() below
            linkColor: 'rgba(255,255,255,0.25',
            shape: 'bug', // harder to draw, sprites help a LOT
            shapeSize: 2,
            colorMap: ColorMap.Basic16,
        }
    }

    // ======================

    constructor(options) {
        options = Object.assign(HelloMVC.defaultOptions(), options)
        super(new HelloModel(options.world), options)
        Object.assign(this, options)
    }

    draw() {
        const model = this.model
        const view = this.view

        // Just draw patches once, results cached in view.patchesView
        if (this.animator.draws === 0) {
            view.createPatchPixels(i => Color.randomGrayPixel(0, 100))
        }

        view.clear()
        view.drawPatches() // redraw cached patches colors

        view.drawLinks(model.links, { color: this.linkColor, width: 1 })
        view.drawTurtles(model.turtles, p => ({
            shape: this.shape,
            color: this.colorMap.atIndex(p.id).css,
            size: this.shapeSize,
        }))
    }
}
