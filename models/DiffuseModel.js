import World from '../src/World.js'
import Model from '../src/Model.js'
import util from '../src/util.js'

export default class DiffuseModel extends Model {
    static defaultOptions() {
        return {
            population: 2,
            speed: 0.5,
            wiggle: 0.1,
            radius: 6,

            diffuseRate: 0.05,
            seedDelta: 0.1,
            seedMax: 0.8,
        }
    }

    // ======================

    constructor(worldDptions = World.defaultOptions(200, 100)) {
        super(worldDptions)
        Object.assign(this, DiffuseModel.defaultOptions())
    }

    setup() {
        // this.patches.own('ran ds')
        this.turtles.setDefault('speed', this.speed)
        this.turtles.setDefault('atEdge', 'wrap')
        // this.turtles.setDefault('size', 5)

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
            t.theta += util.randomCentered(this.wiggle)
            t.forward(t.speed)
            this.patches.inRadius(t.patch, this.radius, true).ask(p => {
                p.ran = Math.min(p.ran + this.seedDelta, this.seedMax)
            })
        })

        this.patches.diffuse('ran', this.diffuseRate)
    }
}
