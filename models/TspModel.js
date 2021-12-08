import World from '../src/World.js'
import Model from '../src/Model.js'
import * as util from '../src/utils.js'

export default class TSPModel extends Model {
    nodeCount = 50
    travelersCount = 100
    growPopulation = true
    useInversion = true
    stopTickDifference = 500

    onChange = (length, changes, ticks) => {} // called whenever a tour changes

    // ======================

    constructor(worldDptions = World.defaultOptions(50)) {
        super(worldDptions)
    }

    setup() {
        this.turtleBreeds('nodes travelers')
        this.travelers.setDefault('hidden', true)
        this.nodes.setDefault('theta', 0) // override promotion to random angle

        // globals
        this.done = false
        this.bestTourNodes = []
        this.bestTourLength = 0
        this.bestTourTick = 0
        this.tourChanges = 0

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
            this.onChange(a.tourLength, this.tourChanges, this.ticks)
            this.tourChanges++
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

    moveNode(node, x, y) {
        node.setxy(x, y)
        this.bestTourLength = this.links.reduce((sum, l) => sum + l.length(), 0)
        // node.tourLength = this.lengthFromNodes(this.nodes)
        // a.tourLength = @lengthFromNodes a.tourNodes for a in @travelers
        this.travelers.ask(
            t => (t.tourLength = this.lengthFromNodes(t.tourNodes))
        )
        this.done = false
    }
}
