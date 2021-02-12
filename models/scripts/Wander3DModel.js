var util = AS.util
var Model3D = AS.Model3D

class Wander3DModel extends Model3D {
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
const defaultModel = Wander3DModel

