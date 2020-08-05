import HelloModel from './HelloModel.js'
import util from '../src/util.js'

// Here is a simple modification that allows setting the population dynamically.
// Note that speed & wiggle are already dynamic.
export default class HelloPlusModel extends HelloModel {
    static defaultOptions() {
        return {
            population: 200, // override HelloModel
            minPopulation: 10,
            maxPopulation: 500,
            changeTick: 100, // set to null to avoid auto population changes
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, HelloPlusModel.defaultOptions())
    }

    step() {
        if (
            this.changeTick & (this.ticks !== 0) &&
            util.mod(this.ticks, this.changeTick) === 0
        ) {
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
            this.turtles.create(delta, t => {
                const patch = this.patches.oneOf()
                t.setxy(patch.x, patch.y)
            })
        }
        // make sure all turtles have at least one link
        this.turtles.ask(t => {
            if (t.links.length === 0) {
                this.links.create(t, this.turtles.otherOneOf(t))
            }
        })
    }
}
