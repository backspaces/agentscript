import Model from '../src/Model.js'
import * as util from '../src/utils.js'
// import * as util from '../src/jsUtils.js'

class HelloModel extends Model {
    population = 10 // number of turtles
    speed = 0.1 // step size in patch units
    wiggleAngle = 10 // util.degToRad(10)
    noLinks = false

    // ======================

    // We can use Model's constructor, due to using Model's default World.
    // If you pass in world options, Model will use them
    // constructor() {
    //     super() // use default world options.
    // }

    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })

        if (this.population < 2 || this.noLinks) return
        this.turtles.ask(t => {
            this.links.create(t, this.turtles.otherOneOf(t))
        })
    }

    step() {
        this.turtles.ask(t => {
            t.heading += util.randomCentered(this.wiggleAngle)
            t.forward(this.speed)
        })
    }
}

export default HelloModel
