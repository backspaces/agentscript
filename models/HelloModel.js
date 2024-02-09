import World from 'https://code.agentscript.org/src/World.js'
import Model from 'https://code.agentscript.org/src/Model.js'
import * as util from 'https://code.agentscript.org/src/utils.js'

class HelloModel extends Model {
    population = 10 // number of turtles
    speed = 0.1 // step size in patch units
    wiggleAngle = 10 // wiggle angle in degrees

    constructor(worldOptions = World.defaultOptions()) {
        super(worldOptions) // call "Model"s constructor
    }

    setup() {
        // Have turtles "bounce" at the Patches edges. Default is to wrap
        this.turtles.setDefault('atEdge', 'bounce')

        // create "population" turtles placed on random patches
        this.turtles.create(this.population, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })

        // create a link from every turtle to a random other turtle
        this.turtles.ask(t => {
            this.links.create(t, this.turtles.otherOneOf(t))
        })
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
