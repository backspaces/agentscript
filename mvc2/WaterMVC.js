import WaterModel from '../models/WaterModel.js'
import TwoMVC from '../src/TwoMVC.js'
import ColorMap from '../src/ColorMap.js'
import World from '../src/World.js'

export default class WaterMVC extends TwoMVC {
    static defaultOptions() {
        return {
            // Model defaults, you can override here:
            // strength: 100,
            // surfaceTension: 56,
            // friction: 0.99,
            // drip: 50,

            // TwoMVC defaults, you can override here:
            // div: document.body,
            // useSprites: false,
            // patchSize: 10,
            patchSize: 4,

            // View parameters, used by draw() below
            colorMap: ColorMap.gradientColorMap(256, ['navy', 'aqua']),
            maxZ: 10,
            useSmoothing: true, // unusual to have non-crisp patches
        }
    }

    // ======================

    constructor(options) {
        options = Object.assign(WaterMVC.defaultOptions(), options)
        super(new WaterModel(World.defaultOptions(100, 75)), options)
        Object.assign(this, options)
        this.view.setPatchesSmoothing(this.useSmoothing)
    }

    draw() {
        const model = this.model
        const view = this.view
        const maxZ = this.maxZ

        // view.drawPatches(model.patches, p => this[p.type])
        view.drawPatches(
            model.patches,
            p => this.colorMap.scaleColor(p.zpos, -maxZ, maxZ).pixel
        )
    }
}
