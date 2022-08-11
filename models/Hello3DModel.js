import * as util from '../src/utils.js'
import Model from '../src/Model3D.js'

export default class Hello3DModel extends Model {
    population = 100
    speed = 0.1 // patches per step
    wiggleAngle = 10 // degrees
    linksToo = true // handy to show just turtles if false

    // ======================

    // We can use Model's constructor, due to using Model's default World.
    // If you pass in world options, Model will use them
    // constructor() {
    //     super() // use default world options.
    // }
    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            t.setxyz(...this.world.random3DPoint())
        })

        if (this.linksToo)
            this.turtles.ask(t => {
                if (this.population > 1)
                    this.links.create(t, this.turtles.otherOneOf(t))
            })
    }

    step() {
        this.turtles.ask(t => {
            t.left(util.randomCentered(this.wiggleAngle))
            t.forward(this.speed)
        })
    }
}
