import World from '/src/World.js'
import Model from '/src/Model.js'
import * as util from '/src/utils.js'

export default class DiffuseModel extends Model {
    population = 4
    speed = 0.5
    wiggleAngle = 10
    startAtCenter = false
    radius = 6
    diffuseRate = 0.05
    seedDelta = 0.1
    seedMax = 0.8

    centerPatch

    // ======================

    constructor(worldOptions = World.defaultOptions(100)) {
        super(worldOptions)
    }

    setup() {
        this.patches.ask(p => {
            p.ran = util.randomFloat(1.0)
        })

        // this.patches.nOf(this.population).ask(p => {
        //     p.sprout(1, this.turtles)
        // })
        this.turtles.create(this.population, t => {
            if (!this.startAtCenter) t.moveTo(this.patches.oneOf())
        })

        // this.centerPatch = this.patches.avg('ran') * 10
        this.centerPatch = this.patches.patch(0, 0).ran * 10
    }

    step() {
        this.turtles.ask(t => {
            t.heading += util.randomCentered(this.wiggleAngle)
            t.forward(this.speed)
            this.patches.inRadius(t.patch, this.radius, true).ask(p => {
                p.ran = Math.min(p.ran + this.seedDelta, this.seedMax)
            })
        })

        this.patches.diffuse('ran', this.diffuseRate)

        // this.centerPatch = this.patches.avg('ran') * 10
        this.centerPatch = this.patches.patch(0, 0).ran * 10
    }
}
