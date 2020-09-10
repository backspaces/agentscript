var Model = AS.Model
var util = AS.util

class WalkersModel extends Model {
    static defaultOptions() {
        return {
            population: 10,
            speed: 0.1,
            speedDelta: 0.025,
            wiggle: 0.1,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, WalkersModel.defaultOptions())
    }
    setup() {
        this.turtles.create(this.population, t => {
            t.speed = this.speed + util.randomCentered(this.speedDelta)
            t.setxy(...this.world.randomPoint())
        })
    }
    step() {
        this.turtles.ask(t => {
            t.theta += util.randomCentered(this.wiggle)
            t.forward(t.speed)
        })
    }
}
const defaultModel = WalkersModel
