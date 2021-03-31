import Model from '../src/Model.js'
import * as util from '../src/utils.js'

export default class FlockModel extends Model {
    population = 1000
    vision = 3
    speed = 0.25
    maxTurn = util.degToRad(3.0) // using radian geometry
    minSeparation = 0.75

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        util.setGeometry(this, 'radians')
    }

    setup() {
        this.turtles.setDefault('speed', this.speed)
        this.patches.cacheRect(this.vision)

        util.repeat(this.population, () => {
            this.patches.oneOf().sprout()
        })
    }

    step() {
        this.turtles.ask(t => {
            this.flock(t)
        })
    }
    flock(t) {
        const flockmates = this.turtles.inRadius(t, this.vision, false)
        if (flockmates.length !== 0) {
            const nearest = flockmates.minOneOf(f => f.distance(t))
            if (t.distance(nearest) < this.minSeparation) {
                this.separate(t, nearest)
            } else {
                this.align(t, flockmates)
                this.cohere(t, flockmates)
            }
        }
        t.forward(t.speed)
    }
    separate(t, nearest) {
        const angle = nearest.towards(t)
        this.turnTowards(t, angle)
    }
    align(t, flockmates) {
        this.turnTowards(t, this.averageHeading(flockmates))
    }
    cohere(t, flockmates) {
        this.turnTowards(t, this.averageHeadingTowards(t, flockmates))
    }

    turnTowards(t, theta) {
        let turn = util.subtractRadians(theta, t.theta)
        turn = util.clamp(turn, -this.maxTurn, this.maxTurn)
        t.rotate(turn)
    }
    averageHeading(flockmates) {
        const thetas = flockmates.map(f => f.theta)
        const dx = thetas.map(t => Math.cos(t)).reduce((x, y) => x + y)
        const dy = thetas.map(t => Math.sin(t)).reduce((x, y) => x + y)
        return Math.atan2(dy, dx)
    }
    averageHeadingTowards(t, flockmates) {
        const towards = flockmates.map(f => f.towards(t))
        const dx = towards.map(t => Math.cos(t)).reduce((x, y) => x + y)
        const dy = towards.map(t => Math.sin(t)).reduce((x, y) => x + y)
        return Math.atan2(dy, dx)
    }

    flockVectorSize() {
        const thetas = this.turtles.map(t => t.theta)
        const dx = thetas.map(theta => Math.cos(theta)).reduce((x, y) => x + y)
        const dy = thetas.map(theta => Math.sin(theta)).reduce((x, y) => x + y)
        return Math.sqrt(dx * dx + dy * dy) / this.population
    }
}
