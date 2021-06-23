import World from '../src/World.js'
import Model from '../src/Model.js'
import * as util from '../src/utils.js'

// A port of the NetLogo "Virus on a Network" model
export default class VirusModel extends Model {
    population = 150
    averageNodeDegree = 6
    outbreakSize = 3
    virusSpreadPercent = 2.5
    virusCheckFrequency = 1
    recoveryPercent = 5.0
    gainResistancePercent = 5.0

    // ======================

    constructor(worldOptions = World.defaultOptions(40)) {
        super(worldOptions)
    }

    setup() {
        this.done = false
        this.setupNodes()
        this.setupNetwork()
        this.turtles.nOf(this.outbreakSize).ask(t => this.becomeInfected(t))
    }
    setupNodes() {
        this.turtles.create(this.population, t => {
            // for visual reasons, we don't put any nodes *too* close to the edges
            t.setxy(...this.world.randomPoint().map(cor => cor * 0.95))
            this.becomeSusceptible(t)
            t.virusCheckTimer = util.randomInt(this.virusCheckFrequency)
        })
    }
    setupNetwork() {
        // REMIND
        const numLinks = (this.averageNodeDegree * this.population) / 2
        // console.log(numLinks)

        while (this.links.length < numLinks) {
            const t1 = this.turtles.oneOf()
            const others = this.turtles
                .other(t1)
                .with(t => !t.linkNeighbors().includes(t1))
            const choice = others.minOneOf(t => t1.distance(t))
            this.links.createOne(t1, choice)
        }
    }

    step() {
        if (this.done) return

        this.turtles.ask(t => {
            t.virusCheckTimer++
            if (t.virusCheckTimer >= this.virusCheckFrequency)
                t.virusCheckTimer = 0
        })
        this.spreadVirus()
        this.doVirusChecks()

        this.done = this.turtles.all(o => !o.infected)
    }

    becomeInfected(t) {
        t.infected = true
        t.resistant = false
        t.state = 'infected'
    }
    becomeSusceptible(t) {
        t.infected = t.resistant = false
        t.state = 'susceptible'
    }
    becomeResistant(t) {
        t.infected = false
        t.resistant = true
        t.state = 'resistant'
    }

    spreadVirus() {
        this.turtles
            .with(t => t.infected)
            .ask(t => {
                t.linkNeighbors()
                    .with(n => !n.resistant)
                    .ask(n => {
                        if (util.randomFloat(100) < this.virusSpreadPercent)
                            this.becomeInfected(n)
                    })
            })
    }
    doVirusChecks() {
        this.turtles
            .with(t => t.infected && t.virusCheckTimer === 0)
            .ask(t => {
                if (util.randomInt(100) < this.recoveryPercent) {
                    if (util.randomInt(100) < this.gainResistancePercent) {
                        this.becomeResistant(t)
                    } else {
                        this.becomeSusceptible(t)
                    }
                }
            })
    }
}
