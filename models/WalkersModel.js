import Model from '../src/Model.js'
import util from '../src/util.js'

export default class WalkersModel extends Model {
    static defaults() {
        return {
            population: 10,
            speed: 0.1,
            speedDelta: 0.025,
            wiggle: 0.1,
        }
    }

    // ======================

    constructor(options) {
        super(options)
        Object.assign(this, this.constructor.defaults())
    }
    setup() {
        this.turtles.setDefault('atEdge', 'wrap')

        this.turtles.create(this.population, t => {
            t.speed = this.speed + util.randomCentered(this.speedDelta)
            t.setxy(...this.world.randomPosition())
        })
    }
    step() {
        this.turtles.ask(t => {
            t.theta += util.randomCentered(this.wiggle)
            t.forward(t.speed)
        })
    }
}
