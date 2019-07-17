import Model from '../src/Model.js'
import util from '../src/util.js'

export default class HelloModel extends Model {
    static defaults() {
        return {
            population: 10,
            speed: 0.1,
            wiggle: 0.1,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions)
        // Either of these work, ctor call doesn't need to know class name
        // Object.assign(this, this.constructor.defaults())
        Object.assign(this, HelloModel.defaults())
    }
    setup() {
        this.turtles.setDefault('atEdge', 'bounce')
        // this.turtles.setDefault('speed', this.speed)

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
}
