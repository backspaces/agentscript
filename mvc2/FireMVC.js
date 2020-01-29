import FireModel from '../models/FireModel.js'
import TwoMVC from '../src/TwoMVC.js'
import Color from '../src/Color.js'
// import ColorMap from '../src/ColorMap.js'

export default class FireMVC extends TwoMVC {
    static defaultOptions() {
        return {
            // Model defaults, set by MVC ctor
            // density: 60, // percent

            patchSize: 4,

            // Draw defaults
            dirt: Color.cssToPixel('yellow'),
            tree: Color.cssToPixel('green'),
            fire: Color.cssToPixel('red'),
            ember4: Color.rgbaToPixel(255 - 25, 0, 0),
            ember3: Color.rgbaToPixel(255 - 50, 0, 0),
            ember2: Color.rgbaToPixel(255 - 75, 0, 0),
            ember1: Color.rgbaToPixel(255 - 100, 0, 0),
            ember0: Color.rgbaToPixel(255 - 125, 0, 0),
        }
    }

    // ======================

    // constructor(options) {
    //     // Use model's default world unless overriden
    //     super(FireModel, div, world)
    //     Object.assign(this, FireMVC.defaultOptions())
    // }
    constructor(options) {
        options = Object.assign(FireMVC.defaultOptions(), options)
        super(FireModel, options)
        Object.assign(this, options)
    }

    draw() {
        const model = this.model
        const view = this.view

        view.drawPatches(model.patches, p => this[p.type])
    }
}
