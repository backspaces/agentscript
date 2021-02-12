import * as util from '../src/utils.js'
import Model3D from '../src/Model3D.js'

export default class Wander3DModel extends Model3D {
    static defaultOptions() {
        return {
            population: 25,
            speed: 0.1, // patches per step
            wiggleAngle: util.degToRad(30),
            rotateEvery: 15,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, Wander3DModel.defaultOptions())
    }
    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            t.setxyz(...this.world.random3DPoint())
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
