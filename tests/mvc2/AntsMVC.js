import AntsModel from '../models/AntsModel.js'
import TwoMVC from './TwoMVC.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import World from '../src/World.js'

export default class AntsMVC extends TwoMVC {
    static defaultOptions() {
        return {
            // Model defaults, you can override here:
            // population: 255,
            // speed: 1.0,
            // maxPheromone: 35,
            // diffusionRate: 0.3,
            // evaporationRate: 0.01,
            // wiggleAngle: util.degToRad(30),

            // TwoMVC defaults, you can override here:
            // div: document.body,
            // useSprites: false,
            // patchSize: 10,
            useSprites: true,

            // View parameters, used by draw() below
            shape: 'bug', // harder to draw, sprites help a LOT
            shapeSize: 3,
            nestColor: Color.typedColor('yellow'),
            foodColor: Color.typedColor('blue'),
        }
    }

    // ======================

    constructor(options) {
        options = Object.assign(AntsMVC.defaultOptions(), options)
        super(new AntsModel(World.defaultOptions(30)), options)
        Object.assign(this, options)
    }

    // Extend setup to initialize patches
    setup() {
        super.setup()

        this.nestColorMap = ColorMap.gradientColorMap(20, [
            'black',
            this.nestColor.css,
        ])
        this.foodColorMap = ColorMap.gradientColorMap(20, [
            'black',
            this.foodColor.css,
        ])
    }

    draw() {
        // view.clear()
        view.drawPatches(this.model.patches, p => {
            if (p.isNest) return this.nestColor.pixel
            if (p.isFood) return this.foodColor.pixel
            const color =
                p.foodPheromone > p.nestPheromone
                    ? this.foodColorMap.scaleColor(p.foodPheromone, 0, 1)
                    : this.nestColorMap.scaleColor(p.nestPheromone, 0, 1)
            return color.pixel
        })

        view.drawTurtles(model.turtles, t => ({
            shape: this.shape,
            color: t.carryingFood ? this.nestColor.css : this.foodColor.css,
            size: this.shapeSize,
        }))
    }
}
