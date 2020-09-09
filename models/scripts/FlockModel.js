var Model = AS.Model
var util = AS.util

class FlockModel extends Model {
    static defaultOptions() {
        return {
            population: 1000,
            vision: 3,
            speed: 0.25,
            maxTurn: util.degToRad(3.0),
            minSeparation: 0.75,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, FlockModel.defaultOptions())
    }

    // setMaxTurn(maxTurnDegrees) {
    //     this.maxTurn = util.degToRad(maxTurnDegrees)
    // }
    setup() {
        Object.assign(this, this.UI)

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
        const theta = nearest.towards(t)
        this.turnTowards(t, theta)
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
        const headings = this.turtles.map(t => t.theta)
        const dx = headings
            .map(theta => Math.cos(theta))
            .reduce((x, y) => x + y)
        const dy = headings
            .map(theta => Math.sin(theta))
            .reduce((x, y) => x + y)
        return Math.sqrt(dx * dx + dy * dy) / this.population
    }
}
const defaultModel = FlockModel

