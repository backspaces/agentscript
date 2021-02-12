var World = AS.World
var Model = AS.Model
var util = AS.util

class DiffuseModel extends Model {
    population = 2
    speed = 0.5
    wiggleAngle = util.degToRad(10)
    radius = 6

    diffuseRate = 0.05
    seedDelta = 0.1
    seedMax = 0.8

    // static defaultOptions() {
    //     return {
    //         population: 2,
    //         speed: 0.5,
    //         wiggleAngle: util.degToRad(10),
    //         radius: 6,

    //         diffuseRate: 0.05,
    //         seedDelta: 0.1,
    //         seedMax: 0.8,
    //     }
    // }

    // ======================

    constructor(worldOptions = World.defaultOptions(200, 100)) {
        super(worldOptions)
        // Object.assign(this, DiffuseModel.defaultOptions())
    }

    setup() {
        this.turtles.setDefault('speed', this.speed)

        this.patches.ask(p => {
            p.ran = util.randomFloat(1.0)
            // p.ds = 0
        })

        this.patches.nOf(this.population).ask(p => {
            p.sprout(1, this.turtles)
        })
    }
    step() {
        this.turtles.ask(t => {
            t.theta += util.randomCentered(this.wiggleAngle)
            t.forward(t.speed)
            this.patches.inRadius(t.patch, this.radius, true).ask(p => {
                p.ran = Math.min(p.ran + this.seedDelta, this.seedMax)
            })
        })

        this.patches.diffuse('ran', this.diffuseRate)
    }
}
const defaultModel = DiffuseModel

