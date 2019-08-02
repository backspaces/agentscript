const Model = AS.Model
const util = AS.util

class HelloModel extends Model {
    static defaultOptions() {
        return {
            population: 10,
            speed: 0.1,
            wiggle: 0.1,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options
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

// Here is a simple modification that allows setting the population dynamically.
// Note that speed & wiggle are already dynamic.
export class HelloModelPlus extends HelloModel {
    step() {
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
