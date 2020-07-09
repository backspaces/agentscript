import util from 'http://agentscript.org/src/util.js'
import Model from 'http://agentscript.org/src/Model.js'

// A really simple "random walker" hello world model
export default class HelloModel extends Model {
    static defaultOptions() {
        return {
            population: 10,
            speed: 0.1,
            wiggle: 0.1,
        }
    }
    constructor() {
        super() // use default world options
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
}
