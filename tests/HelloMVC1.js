import MVC from './MVC1.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'

export default class HelloMVC extends MVC {
    static defaultOptions() {
        return {
            // Model defaults, you can override here:
            // population: 10,
            // speed: 0.1,
            // wiggle: 0.1,

            // Draw defaults
            linksColor: 'white',
            shape: 'dart',
            shapeSize: 2,
            colorMap: ColorMap.Basic16,
        }
    }

    // ======================

    constructor(HelloModel, worldDptions) {
        super(HelloModel, worldDptions)
        Object.assign(this, HelloMVC.defaultOptions())
    }

    draw() {
        const model = this.model
        const view = this.view

        // Just draw patches once, results cached in view
        if (this.animator.draws === 0) {
            view.createPatchPixels(i => Color.randomGrayPixel(0, 100))
        }

        view.clear()
        view.drawPatches() // redraw cached patches colors

        view.drawLinks(model.links, { color: this.linksColor, width: 1 })
        view.drawTurtles(model.turtles, p => ({
            shape: this.shape,
            color: this.colorMap.atIndex(p.id).css,
            size: this.shapeSize,
        }))
    }
}
