import Model from '../src/Model.js'
import * as util from '../src/utils.js'

/**
 * This is a subclass of {@link Model}, supplying it's own
 * setup and step. All our models do this: subclass Model
 * or an other model subclassing Model.
 *
 * Above we import class Model and all the utilities in  {@link utils}
 */

class HelloModel extends Model {
    population = 10 // number of turtles
    speed = 0.1 // step size in patch units
    wiggleAngle = 10 // util.degToRad(10)
    noLinks = false // whether or not to create random links between turtles

    // ======================

    /**
     * Creates an instance of HelloModel.
     * You can see how default options work here {@link World#}
     *
     * @constructor
     * @param {*} [worldOptions=undefined]
     */
    constructor(worldOptions = undefined) {
        super(worldOptions)
    }

    /**
     * Setup initializes the model, managing the patches, turtles, and Links.
     *
     * Here we define how turtles handle the edge, here "bouncing" all the edge.
     * It creates population turtles
     */
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

    /**
     * Step updates the model by one step.
     * Here it has the turtles turn a random amount and
     * go forward one patch width
     */
    step() {
        this.turtles.ask(t => {
            t.heading += util.randomCentered(this.wiggleAngle)
            t.forward(this.speed)
        })
    }
}

export default HelloModel
