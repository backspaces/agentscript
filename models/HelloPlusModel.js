import HelloModel from 'https://code.agentscript.org/models/HelloModel.js'
import * as util from 'https://code.agentscript.org/src/utils.js'

// Here is a simple modification that allows setting the population dynamically.
// Note that speed & wiggle are already dynamic.
export default class HelloPlusModel extends HelloModel {
    population = 15 // override HelloModel
    minPopulation = 5
    maxPopulation = 25
    changeTick = 25 // set to null to avoid auto population changes

    // ======================

    // We can use Model's constructor, due to using Model's default World.
    // If you pass in world options, Model will use them
    constructor() {
        super() // use default world options.
    }

    step() {
        if (util.mod(this.ticks, this.changeTick) === 0) {
            // true when ticks = 0
            this.population = util.randomInt2(
                this.minPopulation,
                this.maxPopulation
            )
            console.log('new population', this.population)
        }
        this.checkPopulation()
        super.step()
    }
    checkPopulation() {
        // return if no change
        const delta = this.population - this.turtles.length
        if (delta === 0) return

        // add/remove turtles as needed
        if (delta < 0) {
            util.repeat(-delta, () => this.turtles.oneOf().die())
        } else {
            this.turtles.create(delta, t => t.moveTo(this.patches.oneOf()))
        }
        // make sure all turtles have at least one link
        this.turtles.ask(t => {
            if (t.links.length === 0) {
                this.links.create(t, this.turtles.otherOneOf(t))
            }
        })
    }
}
