import Model from 'https://code.agentscript.org/src/Model.js'

// Subclass class Model to create our new model, HelloModel
class MinModel extends Model {
    population = 10 // number of turtles
    speed = 0.25 // step size in patch units

    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            t.setxy(0, 0)
        })

        this.turtles.ask(t => {
            this.links.create(t, this.turtles.otherOneOf(t))
        })
    }

    step() {
        this.turtles.ask(t => {
            t.forward(this.speed)
        })
    }
}

export default MinModel
