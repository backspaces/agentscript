import * as util from 'https://agentscript.org/src/utils.js'
import Model from 'https://agentscript.org/src/Model3D.js'

export default class Wander3DModel extends Model {
    population = 25
    speed = 0.1 // patches per step
    wiggleAngle = 30 // degrees
    rotateEvery = 15

    // ======================

    // We can use Model's constructor, due to using Model's default World.
    // If you pass in world options, Model will use them
    constructor() {
        super() // use default world options.
    }

    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            t.setxyz(this.world.random3DPoint())
        })
    }

    step() {
        const doRotations = this.ticks % this.rotateEvery === 0
        this.turtles.ask(t => {
            if (doRotations) {
                t.right(util.randomCentered(this.wiggleAngle))
                t.tiltUp(util.randomCentered(this.wiggleAngle))
                t.rollRight(util.randomCentered(this.wiggleAngle))
            }
            t.forward(this.speed)
        })
    }
}
