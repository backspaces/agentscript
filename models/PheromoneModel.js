import Model from 'https://code.agentscript.org/src/Model.js'
import World from 'https://code.agentscript.org/src/World.js'
import * as util from 'https://code.agentscript.org/src/utils.js'

// Create PheromoneModel subclass of Model. "export" allows it to be imported elsewhere
export default class PheromoneModel extends Model {
    // Here are the variables we'll use. They are accessed via "this.population" etc.
    population = 30 // number of turtles
    rotateAngle = 50 // rotate between -25 & +25
    addPheromone = 10 // how much to add to patches under a turtle
    evaporateToo = true // decrease all patches pheromone too?
    evaporateDelta = 0.99 // how much to decrease pheromone as fraction

    // worldOptions: min/max for x, y. defaultOptions(15) helper sets x, y between -15 to +15
    constructor(worldOptions = World.defaultOptions(15)) {
        super(worldOptions)
    }

    // setup is called once to initialize the model.
    setup() {
        // create population turtles, placing them randomly on the patches
        this.turtles.create(this.population, turtle => {
            turtle.moveTo(this.patches.oneOf())
        })

        // initialize the patches with the pheromone value of 0
        this.patches.ask(patch => {
            patch.pheromone = 0
        })
    }

    // step is called multiple times, animating our model
    step() {
        this.turtles.ask(turtle => {
            // ask all turtles to go forward 1 and randomly rotate.
            // then add to the pheromone of the patch the turtle ends on.
            turtle.forward(1)
            turtle.rotate(util.randomCentered(this.rotateAngle))
            turtle.patch.pheromone += this.addPheromone
        })

        if (this.evaporateToo) {
            // reduce patch.pheromone by the multiple of evaporateDelta
            this.patches.ask(patch => {
                patch.pheromone *= this.evaporateDelta
            })
        }
    }
}
