import HelloModel from '../models/HelloModel.js'
import TwoMVC from '../src/TwoMVC.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'

export default class HelloMVC extends TwoMVC {
    static defaultOptions() {
        return {
            // Model defaults, set by MVC ctor
            // population: 10,
            // speed: 0.1,
            // wiggle: 0.1,

            // TwoMVC defaults, you can override:
            // world: undefined, // use model's default world
            // div: document.body,
            // useSprites: false,
            // patchSize: 10,

            // View defaults
            linkColor: 'white',
            shape: 'dart',
            shapeSize: 2,
            colorMap: ColorMap.Basic16,
        }
    }

    // ======================

    constructor(options) {
        options = Object.assign(HelloMVC.defaultOptions(), options)
        super(HelloModel, options)
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
