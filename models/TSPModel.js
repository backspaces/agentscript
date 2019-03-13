import Model from '../src/Model.js'
import util from '../src/util.js'

export default class TSPModel extends Model {
    static defaults() {
        return {
            nodeCount: 50,
            travelersCount: 100,
            growPopulation: true,
            useInversion: true,
            stopTickDifference: 500,
        }
    }

    // ======================

    constructor(options) {
        super(options)
        Object.assign(this, TSPModel.defaults())
    }

    setup() {
        this.turtleBreeds('nodes travelers')

        // globals
        this.done = false
        this.bestTourNodes = []
        this.bestTourLength = 0
        this.bestTourTick = 0

        this.nodes.setDefault('heading', 0) // override promotion to random angle
        // this.travelers.setDefault('hidden', true) // REMIND

        this.nodes.create(this.nodeCount, node => {
            this.setupNode(node)
        })

        this.createTourLinks(this.nodes) //()
        this.bestTourLength = this.links.reduce((sum, l) => sum + l.length(), 0)

        this.travelers.create(this.travelersCount, t => this.setupTraveler(t))
    }

    setupNode(node) {
        // REMIND: space the nodes away from each other
        node.moveTo(this.patches.oneOf())
    }
    setupTraveler(t) {
        t.tourNodes = this.nodes.clone().shuffle()
        t.tourLength = this.lengthFromNodes(t.tourNodes)
    }

    step() {
        if (this.done) return
        this.travelers.ask(t => this.makeTour(t))
        this.installBestTour()
        this.stopIfDone()
    }

    createTourLinks(nodeList) {
        this.links.clear()
        nodeList.ask((node, i) => {
            const nextNode = nodeList[(i + 1) % nodeList.length]
            this.links.create(node, nextNode)
        })
    }
    lengthFromNodes(nodeList) {
        let len = 0
        nodeList.ask((node, i) => {
            const nextNode = nodeList[(i + 1) % nodeList.length]
            len += node.distance(nextNode)
        })
        return len
    }

    installBestTour() {
        while (this.travelers.length > this.travelersCount) {
            this.travelers.maxOneOf('tourLength').die()
        }
        const a = this.travelers.minOneOf('tourLength')
        if (a.tourLength < this.bestTourLength) {
            this.bestTourLength = a.tourLength
            this.bestTourNodes = a.tourNodes
            this.bestTourTick = this.ticks
            this.reportNewTour()
            this.createTourLinks(this.bestTourNodes)
        }
    }

    makeTour(a) {
        const nlist = this.useInversion
            ? this.inversionStrategy(a)
            : this.randomStrategy(a)
        const len = this.lengthFromNodes(nlist)
        if (this.growPopulation) {
            a.hatch(1, this.travelers, a => {
                a.tourNodes = nlist
                a.tourLength = len
            })
        } else if (len < a.tourLength) {
            a.tourNodes = nlist
            a.tourLength = len
        }
    }
    randomStrategy(a) {
        return a.tourNodes.clone().shuffle()
    }
    inversionStrategy(a) {
        return this.newInversion(a.tourNodes)
    }

    newInversion(nlist) {
        let len = nlist.length
        const i = util.randomInt(len - 1)
        len = 2 + util.randomInt(len - i - 2)
        return nlist // result will be agentarray
            .slice(0, i)
            .concat(nlist.slice(i, i + len).reverse())
            .concat(nlist.slice(i + len))
    }

    stopIfDone() {
        if (this.ticks - this.bestTourTick === this.stopTickDifference) {
            console.log(
                `Stop: no change after ${this.stopTickDifference} ticks`,
                `Best tour: ${this.bestTourLength} at tick ${this.bestTourTick}`
            )
            this.done = true
        }
    }
    reportNewTour() {
        console.log(
            `new best tour at tick ${this.ticks}: ${this.bestTourLength}`
        )
    }
}
