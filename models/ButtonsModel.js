import Model from '../src/Model.js'

export default class ButtonsModel extends Model {
    population = 200 // number of buttons

    // ======================

    // We can use Model's constructor, due to using Model's default World.
    // If you pass in world options, Model will use them
    // constructor() {
    //     super() // use default world options.
    // }

    setup() {
        this.turtles.setDefault('theta', 0) // override promotion to random angle

        this.cluster = new Set()
        this.done = false

        this.turtles.create(this.population, t =>
            t.setxy(...this.world.randomPatchPoint())
        )
    }

    step() {
        if (this.done) return // done, idleing

        const b1 = this.turtles.oneOf()
        const b2 = this.turtles.otherOneOf(b1)

        this.links.create(b1, b2)

        const vertices = this.graphOf(b1)
        if (vertices.size > this.cluster.size) this.cluster = vertices

        if (this.cluster.size === this.turtles.length) {
            this.done = true
            console.log(`Done at tick: ${this.ticks}`)
        }
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
