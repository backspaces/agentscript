import Model from 'https://agentscript.org/src/Model.js'
import World from 'https://agentscript.org/src/World.js'

export default class SlimeMoldModel extends Model {
    wiggleAngle = 30 // This is an interesting variable to play with

    constructor(worldOptions = World.defaultOptions(20)) {
        super(worldOptions)
    }

    setup() {
        this.turtles.create(100)
        this.patches.setDefault('pheromone', 0)
        this.turtles.ask(turtle => {
            let [x, y] = this.world.randomPoint()
            turtle.setxy(x, y)
        })
    }

    step() {
        this.turtles.ask(turtle => {
            let patchAhead = turtle.patchAhead(1)
            let patchRight = turtle.patchRightAndAhead(this.wiggleAngle, 1)
            let patchLeft = turtle.patchLeftAndAhead(this.wiggleAngle, 1)

            if (patchAhead && patchLeft && patchRight) {
                // If the patch to the right has the most pheromone, we turn right
                if (
                    patchRight.pheromone > patchLeft.pheromone &&
                    patchRight.pheromone > patchAhead.pheromone
                ) {
                    turtle.right(this.wiggleAngle)
                }

                // If the patch to the left has the most pheromone, we turn left
                if (
                    patchLeft.pheromone > patchRight.pheromone &&
                    patchLeft.pheromone > patchAhead.pheromone
                ) {
                    turtle.left(this.wiggleAngle)
                }

                // If the patch ahead has the most pheromone, we don't rotate at all
            }

            // If there's no patch to our right or left (because we're at the edge
            // of the world) we turn around.
            if (!patchRight) turtle.left(90)
            if (!patchLeft) turtle.right(90)

            turtle.forward(0.3)
            turtle.patch.pheromone += 10
        })

        // Each patch gives some of its pheromone to its neighbors.
        this.patches.diffuse('pheromone', 0.5)

        // Evaporate the pheromone over time
        this.patches.ask(patch => {
            patch.pheromone *= 0.99
        })
    }
}
