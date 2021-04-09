import * as util from '../src/utils.js'
import Model from '../src/Model.js'

export default class Hello3DModel extends Model {
    population = 100
    speed = 0.1 // patches per step
    wiggleAngle = 10 // degrees
    linksToo = true // handy to show just turtles if false

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
    }
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
