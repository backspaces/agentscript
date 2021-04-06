var Model = AS.Model
var util = AS.util

util.randomSeed()
class FlockModel extends Model {
    population = 1000
    vision = 3 // radius in patches
    speed = 0.25 // distance per step in patches
    maxTurn = 3.0 // max turn in degrees
    minSeparation = 0.75 // Keep turtles apart by this distance, in patches

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        // this.setGeometry(this.geometry)
    }

    setup() {
        this.turtles.setDefault('speed', this.speed)
        this.patches.cacheRect(this.vision)

        util.repeat(this.population, () => {
            this.patches.oneOf().sprout()
        })
        window.t = this.turtles[1]
    }

    step() {
        // console.log(t.heading, t.getxyz())
        console.log(t.theta, t.getxyz())
        this.turtles.ask(t => {
            this.flock(t)
        })
        if (this.ticks % 50 === 49) this.report()
    }
    report() {
        console.log('step', this.ticks + 1, 'cohesion:', this.flockVectorSize())
    }

    flock(t) {
        const flockmates = this.turtles.inRadius(t, this.vision, false)
        if (flockmates.length !== 0) {
            const nearest = flockmates.minOneOf(f => f.distance(t))
            if (t.id === 1)
                console.log('nearest', nearest.id, 'mates', flockmates.length)
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
        // heading is *away* from t towaards nearest, so separates the two
        const heading = nearest.towards(t)
        this.turnTowards(t, heading)
        if (t.id === 1) console.log('separate', t.theta)
    }
    align(t, flockmates) {
        this.turnTowards(t, this.averageHeading(flockmates))
        if (t.id === 1) console.log('align', t.theta)
    }
    cohere(t, flockmates) {
        this.turnTowards(t, this.averageHeadingTowards(t, flockmates))
        if (t.id === 1) console.log('cohere', t.theta)
    }

    turnTowards(t, heading) {
        // let turn = util.subtractRadians(theta, t.theta)
        let turn = util.subtractHeadings(heading, t.heading)
        // let turn = t.subtractHeading(heading)
        turn = util.clamp(turn, -this.maxTurn, this.maxTurn)
        t.rotate(turn)
    }
    averageHeading(flockmates) {
        const thetas = flockmates.map(f => f.theta)
        const dx = thetas.map(t => Math.cos(t)).reduce((x, y) => x + y)
        const dy = thetas.map(t => Math.sin(t)).reduce((x, y) => x + y)
        return util.radToHeading(Math.atan2(dy, dx))
    }
    averageHeadingTowards(t, flockmates) {
        // const towards = flockmates.map(f => util.headingToRad(f.towards(t)))
        const towards = flockmates.map(f => f.towards(t))
        const dx = towards.map(t => Math.cos(t)).reduce((x, y) => x + y)
        const dy = towards.map(t => Math.sin(t)).reduce((x, y) => x + y)
        // return Math.atan2(dy, dx)
        return util.radToHeading(Math.atan2(dy, dx))
    }

    flockVectorSize() {
        const thetas = this.turtles.map(t => t.theta)
        const dx = thetas.map(theta => Math.cos(theta)).reduce((x, y) => x + y)
        const dy = thetas.map(theta => Math.sin(theta)).reduce((x, y) => x + y)
        return Math.sqrt(dx * dx + dy * dy) / this.population
    }
}
const defaultModel = FlockModel

