// Import the modules we need.
import Model from '../src/Model.js'
import World from '../src/World.js'
import * as util from '../src/utils.js'

// Create the PheromoneModel subclass of class Model
// Note we export the model so it can be imported elsewhere
export default class PheromoneModel extends Model {
    // Here are the variables we'll use.
    // They are accessed via "this.population" etc.
    population = 30 // number of turtles
    rotateAngle = 50 // rotate between -25 & +25
    addPheromone = 10 // how mutch to add to patches under a turtle
    evaporateToo = true // decrease all patches pheromone too?
    evaporateDelta = 0.99 // how much to decrease pheromone as fraction

    // worldOptions are the min/max values for x, y, z
    // defaultOptions(15) is a helper for x, y, z between -15 to +15
    constructor(worldDptions = World.defaultOptions(15)) {
        super(worldDptions)
    }

    // setup is called once to initialize the model.
    setup() {
        // create population turtles, placing them randomly on the patches
        this.turtles.create(this.population, turtle => {
            const patch = this.patches.oneOf()
            turtle.setxy(patch.x, patch.y)
        })

        // initialize the patches with the pheromone value of 0
        this.patches.ask(patch => {
            patch.pheromone = 0
        })
    }

    // step is called multiple times, animating our model
    step() {
        // ask turtles to go forward 1 and randomly rotate.
        // then add to the pheromone of the patch the turtle ends on.
        this.turtles.ask(turtle => {
            turtle.forward(1)
            turtle.rotate(util.randomCentered(this.rotateAngle))
            turtle.patch.pheromone += this.addPheromone
        })
        // If we want the pheromone to evaporate each step,
        // reduce patch.pheromone by the multiple of evaporateDelta
        if (this.evaporateToo) {
            this.patches.ask(patch => {
                patch.pheromone *= this.evaporateDelta
            })
        }
    }
}
