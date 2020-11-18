import Model from '../src/Model.js'
import util from '../src/util.js'

class HelloModel extends Model {
    population = 10 // number of turtles
    speed = 0.1 // step size in patch units
    wiggle = util.degToRad(10) // Wiggle angle in radians

    // We can use Model's constructor, due to using Model's default World
    // constructor() {
    //     super() // use default world options.
    // }

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
            t.angle += util.randomCentered(this.wiggle)
            t.forward(this.speed)
        })
    }
}

export default HelloModel
