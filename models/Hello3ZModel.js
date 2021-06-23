import Model from '../src/Model.js'
import * as util from '../src/utils.js'

export default class HelloModel extends Model {
    population = 100
    speed = 0.1 // patches per step
    wiggleAngle = 10 //util.degToRad(10)
    radius

    // ======================

    // We can use Model's constructor, due to using Model's default World.
    // If you pass in world options, Model will use them
    // constructor() {
    //     super() // use default world options.
    // }

    setup() {
        this.radius = this.world.maxX * 0.85
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
            this.moveToSphere(t)
        })

        this.turtles.ask(t => {
            this.links.create(t, this.turtles.otherOneOf(t))
        })
    }

    step() {
        this.turtles.ask(t => {
            // t.theta += util.randomCentered(this.wiggleAngle)
            t.heading += util.randomCentered(this.wiggleAngle)
            t.forward(this.speed)
            this.moveToSphere(t)
        })
    }

    moveToSphere(t) {
        const { x, y } = t
        const r = this.radius
        const z2 = r * r - (x * x + y * y)

        if (z2 <= 0) {
            const theta = Math.atan2(y, x)
            t.setxy(r * Math.cos(theta), r * Math.sin(theta), 0)
            // t.theta = t.theta + Math.PI / 2
            t.heading += 90
        } else {
            t.z = Math.sqrt(z2)
        }
    }
}
