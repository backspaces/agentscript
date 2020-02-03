import MVC from './MVC.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import util from '../src/util.js'

export default class HelloModel extends MVC {
    static defaultOptions() {
        return {
            population: 10,
            speed: 0.1,
            wiggle: 0.1,

            linkColor: 'white',
            shape: 'dart',
            shapeSize: 2,
            colorMap: ColorMap.Basic16,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, HelloModel.defaultOptions())
    }
    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })

        this.turtles.ask(t => {
            this.links.create(t, this.turtles.otherOneOf(t))
        })
    }

    step() {
        this.turtles.ask(t => {
            t.direction += util.randomCentered(this.wiggle)
            t.forward(this.speed)
        })
    }

    draw() {
        // Just draw patches once
        if (this.animator.draws === 0) {
            view.createPatchPixels(i => Color.randomGrayPixel(0, 100))
        }

        view.clear()
        view.drawPatches() // redraw patches colors

        view.drawLinks(model.links, { color: this.linkColor, width: 1 })
        view.drawTurtles(model.turtles, p => ({
            shape: this.shape,
            color: this.colorMap.atIndex(p.id).css,
            size: this.shapeSize,
        }))
    }
}
