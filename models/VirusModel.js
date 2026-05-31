// This model demonstrates the spread of a virus through a network. Although
// the model is somewhat abstract, one interpretation is that each node
// represents a computer, and we are modeling the progress of a computer
// virus (or worm) through this network. Each node may be in one of three
// states: susceptible, infected, or resistant. In the academic literature
// such a model is sometimes referred to as an SIR model for epidemics.

import World from '/src/World.js'
import Model from '/src/Model.js'
import * as util from '/src/utils.js'

// A port of the NetLogo "Virus on a Network" model
export default class VirusModel extends Model {
    population = 150
    averageNodeDegree = 6
    initialOutbreakSize = 3

    virusSpreadPercent = 2.5
    virusCheckFrequency = 1
    recoveryPercent = 5.0
    gainResistancePercent = 5.0

    // ======================

    constructor(worldOptions = World.defaultOptions(40)) {
        super(worldOptions)
    }

    setup() {
        this.setupNodes()
        this.setupNetwork()
        this.turtles
            .nOf(this.initialOutbreakSize)
            .ask(t => this.becomeInfected(t))

        this.postState()
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

    postState() {
        this.susceptible = this.turtles.with(
            t => t.state === 'susceptible'
        ).length
        this.resistant = this.turtles.with(t => t.state === 'resistant').length
        this.infected = this.turtles.with(t => t.state === 'infected').length
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

        this.postState()
        this.done = this.infected === 0
    }

    becomeInfected(t) {
        t.infected = true
        t.resistant = false
        t.state = 'infected'
    }
    becomeSusceptible(t) {
        t.infected = false
        t.resistant = false
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
