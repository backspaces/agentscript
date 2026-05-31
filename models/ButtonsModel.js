import World from 'https://agentscript.org/src/World.js'
import Model from 'https://agentscript.org/src/Model.js'

export default class ButtonsModel extends Model {
    population = 50 // number of buttons
    cluster
    linksCount
    clusterSize

    // ======================

    constructor(worldOptions = World.defaultOptions(20)) {
        super(worldOptions)
    }

    setup() {
        this.turtles.setDefault('theta', 0) // override promotion to random angle

        this.cluster = new Set()

        this.linksCount = this.links.length
        this.clusterSize = this.cluster.size

        this.turtles.create(this.population, t =>
            t.setxy(...this.world.randomPatchPoint())
        )
    }

    step() {
        if (this.done) return

        const b1 = this.turtles.oneOf()
        const b2 = this.turtles.otherOneOf(b1)

        this.links.create(b1, b2)

        const vertices = this.graphOf(b1)
        if (vertices.size > this.cluster.size) this.cluster = vertices

        this.linksCount = this.links.length
        this.clusterSize = this.cluster.size

        this.done = this.cluster.size === this.turtles.length
        if (this.done)
            console.log(
                `done: tick: ${this.ticks + 1}, buttons: ${this.population}, links: ${this.links.length}, cluster: ${this.cluster.size}`
            )
    }

    graphOf(t) {
        const vertices = new Set()
        this.addNeighbors(t, vertices)
        return vertices
    }

    addNeighbors(t, vertices) {
        vertices.add(t)
        t.linkNeighbors().ask(n => {
            if (!vertices.has(n)) this.addNeighbors(n, vertices)
        })
    }
}
