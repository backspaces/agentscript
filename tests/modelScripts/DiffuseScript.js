const Model = AS.Model
const util = AS.util

class DiffuseModel extends Model {
    static defaults() {
        return {
            population: 2,
            speed: 0.5,
            wiggle: 0.1,
            radius: 0,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions)
        Object.assign(this, DiffuseModel.defaults())
    }

    setup() {
        // this.patches.own('ran ds')
        this.turtles.setDefault('speed', this.speed)
        this.turtles.setDefault('atEdge', 'wrap')
        // this.turtles.setDefault('size', 5)

        this.patches.ask(p => {
            p.ran = util.randomFloat(1.0)
            // p.ds = 0
        })

        this.patches.nOf(this.population).ask(p => {
            p.sprout(1, this.turtles)
        })
    }
    step() {
        this.turtles.ask(t => {
            t.theta += util.randomCentered(this.wiggle)
            t.forward(t.speed)
            this.patches.inRadius(t.patch, this.radius, true).ask(p => {
                p.ran = Math.min(p.ran + 0.1, 0.8)
            })
        })

        this.patches.diffuse('ran', 0.05)
    }
}
