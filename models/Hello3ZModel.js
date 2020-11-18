import Model from '../src/Model.js'
import util from '../src/util.js'

export default class HelloModel extends Model {
    static defaultOptions() {
        return {
            population: 100,
            speed: 0.1,
            wiggle: 0.1,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        this.radius = this.world.maxX * 0.85
        Object.assign(this, HelloModel.defaultOptions())
    }
    setup() {
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
            t.angle += util.randomCentered(this.wiggle)
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
            t.theta = t.theta + Math.PI / 2
        } else {
            t.z = Math.sqrt(z2)
        }
    }
}
