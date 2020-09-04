import util from '../src/util.js'
import Model3D from '../src/Model3D.js'

export default class Hello3DModel extends Model3D {
    static defaultOptions() {
        return {
            population: 100,
            speed: 0.1, // patches per step
            wiggle: 0.1, // radians
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, Hello3DModel.defaultOptions())
    }
    setup() {
        this.turtles.setDefault('atEdge', 'wrap')

        this.turtles.create(this.population, t => {
            t.setxyz(...this.world.random3DPoint())
        })

        this.turtles.ask(t => {
            if (this.population > 1)
                this.links.create(t, this.turtles.otherOneOf(t))
        })
    }

    step() {
        this.turtles.ask(t => {
            t.left(util.randomCentered(this.wiggle))
            t.forward(this.speed)
        })
    }
}
