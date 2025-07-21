import World from 'https://code.agentscript.org/src/World.js'
import Model from 'https://code.agentscript.org/src/Model.js'
import * as util from 'https://code.agentscript.org/src/utils.js'

export default class TemplateModel extends Model {
    population = 10 // number of turtles
    speed = 0.25 // step size in patch units
    wiggleAngle = 30 // wiggle angle in degrees

    // worldOptions: patches -16, 16 or 33 x 33 with 0,0 origin
    constructor(worldOptions = World.defaultOptions(16)) {
        super(worldOptions)
    }

    setup() {
        // Have turtles "bounce" at the Patches edges. Default is to wrap
        this.turtles.setDefault('atEdge', 'bounce')

        // create "population" turtles initially on the origin
        this.turtles.create(this.population, t => {
            t.setxy(0, 0)
        })
        // have each turtle create a link to a random other turtle
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
