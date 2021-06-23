import World from '../src/World.js'
import Model from '../src/Model.js'
import * as util from '../src/utils.js'

export default class DiffuseModel extends Model {
    population = 2
    speed = 0.5
    wiggleAngle = 10
    radius = 6
    diffuseRate = 0.05
    seedDelta = 0.1
    seedMax = 0.8

    // ======================

    constructor(worldOptions = World.defaultOptions(200, 100)) {
        super(worldOptions)
    }

    setup() {
        this.turtles.setDefault('speed', this.speed)

        this.patches.ask(p => {
            p.ran = util.randomFloat(1.0)
        })

        this.patches.nOf(this.population).ask(p => {
            p.sprout(1, this.turtles)
        })
    }
    step() {
        this.turtles.ask(t => {
            t.heading += util.randomCentered(this.wiggleAngle)
            t.forward(t.speed)
            this.patches.inRadius(t.patch, this.radius, true).ask(p => {
                p.ran = Math.min(p.ran + this.seedDelta, this.seedMax)
            })
        })

        this.patches.diffuse('ran', this.diffuseRate)
    }
}
