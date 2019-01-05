import Model from '../src/Model.js'
import util from '../src/util.js'

export default class HelloModel extends Model {
    constructor(options) {
        super(options)
        this.population = 10
        this.speed = 0.1
    }

    setup() {
        this.turtles.setDefault('atEdge', 'bounce')
        this.turtles.setDefault('speed', this.speed)

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
            t.direction += util.randomCentered(0.1)
            t.forward(t.speed)
        })
        // this.steps++
    }
}
