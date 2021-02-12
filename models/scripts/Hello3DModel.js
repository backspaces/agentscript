var util = AS.util
var Model3D = AS.Model3D

class Hello3DModel extends Model3D {
    population = 100
    speed = 0.1 // patches per step
    wiggleAngle = util.degToRad(10)
    linksToo = true // handy to show just turtles if false

    // static defaultOptions() {
    //     return {
    //         population: 100,
    //         speed: 0.1, // patches per step
    //         wiggleAngle: util.degToRad(10),
    //         linksToo: true, // handy to show just turtles if false
    //     }
    // }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        // Object.assign(this, Hello3DModel.defaultOptions())
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
const defaultModel = Hello3DModel

