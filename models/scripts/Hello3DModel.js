var Model3D = AS.Model3D
var util = AS.util

const p2 = num => util.precision(num, 2)

class Hello3DModel extends Model3D {
    static defaultOptions() {
        return {
            population: 100,
            speed: 0.1,
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
            t.tiltUp(util.randomCentered(this.wiggle))
            t.rollLeft(util.randomCentered(this.wiggle))
            t.forward(this.speed)
        })
    }
}
const defaultModel = Hello3DModel

