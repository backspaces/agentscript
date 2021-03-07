import Model from '../src/Model.js'
import * as util from '../src/utils.js'

export default class FlockModel extends Model {
    population = 1000
    vision = 3
    speed = 0.25
    maxTurn = util.degToRad(3.0)
    minSeparation = 0.75
    geometry = 'radians' // could be tricky to use heading, later

    // static defaultOptions() {
    //     return {
    //         population: 1000,
    //         vision: 3,
    //         speed: 0.25,
    //         maxTurn: util.degToRad(3.0),
    //         minSeparation: 0.75,
    //     }
    // }

    // ======================

    constructor(worldDptions) {
        // this.geometry = 'radians' // this not defined 'til after super()
        super(worldDptions) // default world options if "undefined"
        this.setGeometry(this.geometry)
        // Object.assign(this, FlockModel.defaultOptions())
    }

    // setMaxTurn(maxTurnDegrees) {
    //     this.maxTurn = util.degToRad(maxTurnDegrees)
    // }
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
        // const vision = this.vision
        // const flockmates = this.turtles.inPatchRect(t, vision, vision, false)
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
        let turn = util.subtractRadians(theta, t.theta) // angle from h to t
        turn = util.clamp(turn, -this.maxTurn, this.maxTurn) // limit the turn
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
