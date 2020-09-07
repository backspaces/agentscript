import util from '../src/util.js'
import Model3D from '../src/Model3D.js'

export default class Wander3DModel extends Model3D {
    static defaultOptions() {
        return {
            population: 25,
            speed: 0.1, // patches per step
            wiggle: 0.1, // radians
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, Wander3DModel.defaultOptions())
    }
    setup() {
        this.turtles.setDefault('atEdge', 'wrap')

        this.turtles.create(this.population, t => {
            t.setxyz(...this.world.random3DPoint())
        })
    }

    step() {
        this.turtles.ask(t => {
            t.right(util.randomCentered(this.wiggle))
            t.tiltUp(util.randomCentered(this.wiggle))
            t.rollRight(util.randomCentered(this.wiggle))
            t.forward(this.speed)
        })
    }
}
