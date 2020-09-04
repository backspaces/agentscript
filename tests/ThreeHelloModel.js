import Model from '../src/Model.js'
import YPR from './object3d.js'
import util from '../src/util.js'

export default class ThreeHelloModel extends Model {
    static defaultOptions() {
        return {
            population: 10,
            speed: 0.1,
            wiggle: 4, // degrees
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, ThreeHelloModel.defaultOptions())
        // this.turtles.AgentClass.prototype.setypr = function (rot) {
        //     // console.log('theta', this.theta)
        // }
    }

    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y, util.randomInt(this.world.width / 10))

            t.ypr = new YPR()
            this.syncTurtle(t)
        })

        this.turtles.ask(t => {
            if (this.population > 1)
                this.links.create(t, this.turtles.otherOneOf(t))
        })
    }

    syncTurtle(t) {
        t.ypr.obj3d.rotation.z = t.theta
        t.ypr.setPosition(t.x, t.y, t.z)
    }
    turtleBounced(t) {
        const pos = t.ypr.position()
        const tpos = [t.x, t.y, t.z]
        return !util.arraysEqual(pos, tpos)
    }

    step() {
        this.turtles.ask(t => {
            if (this.turtleBounced(t)) {
                // console.log('bounce, id:', t.id)
                this.syncTurtle(t)
            }

            t.ypr.left(util.randomCentered(this.wiggle))
            // t.ypr.tiltUp(util.randomCentered(this.wiggle / 5))
            // t.ypr.rollLeft(util.randomCentered(this.wiggle / 5))
            t.ypr.forward(this.speed)

            t.theta = t.ypr.obj3d.rotation.z
            t.setxy(...t.ypr.position())
        })
    }
}
