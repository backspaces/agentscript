import Model from 'https://code.agentscript.org/src/Model.js'
import * as util from 'https://code.agentscript.org/src/utils.js'

// Subclass class Model to create our new model, HelloModel
class HelloModel extends Model {
    population = 10 // number of turtles
    speed = 0.1 // step size in patch units
    wiggleAngle = 10 // wiggle angle in degrees
    linksToo = true // handy to show just turtles if false

    // worldOptions = undefined, means use default worldOptions:
    // 33 x 33 patches with 0,0 origin at the center.
    constructor(worldOptions = undefined) {
        super(worldOptions)
    }

    setup() {
        // Have turtles "bounce" at the Patches edges. Default is to wrap
        this.turtles.setDefault('atEdge', 'bounce')

        // create "population" turtles placed on random patches
        this.turtles.create(this.population, t =>
            t.moveTo(this.patches.oneOf())
        )

        // If links.too is true, create a link from every turtle to another turtle
        if (this.linksToo) {
            this.turtles.ask(t => {
                this.links.create(t, this.turtles.otherOneOf(t))
            })
        }
    }

    step() {
        // change heading randomly, moving forward by "speed"
        this.turtles.ask(t => {
            t.heading += util.randomCentered(this.wiggleAngle)
            t.forward(this.speed)
        })
    }
}

export default HelloModel
