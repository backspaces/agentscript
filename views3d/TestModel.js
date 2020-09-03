import Model3D from '../src/Model3D.js'
import util from '../src/util.js'

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
        this.radius = this.world.maxX * 0.85
        Object.assign(this, Hello3DModel.defaultOptions())
    }
    setup() {
        // this.turtles.setDefault('atEdge', 'bounce')
        // this.turtles.setDefault('atEdge', 'clamp')
        this.turtles.setDefault('atEdge', 'wrap')

        this.turtles.create(this.population, t => {
            // t.setxyz(...this.world.random3DPoint())
            t.setxyz(0, 0, this.world.width / 3)
            // t.setxyz(0, 0, 0)

            t.forward(this.speed / 10)
        })

        // this.turtles.ask(t => {
        //     if (this.population > 1)
        //         this.links.create(t, this.turtles.otherOneOf(t))
        // })
    }

    step() {
        this.turtles.ask(t => {
            // t.left(util.randomCentered(this.wiggle))
            // t.tiltUp(util.randomCentered(this.wiggle))
            // t.rollLeft(util.randomCentered(this.wiggle))
            // t.forward(this.speed)

            // if (this.ticks === 0) t.forward(this.speed)
            t.left(0.1)
            t.forward(this.speed)

            // t.rollLeft(0.1)
            // t.forward(this.speed)
        })
    }
}
