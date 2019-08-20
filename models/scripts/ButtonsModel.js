var Model = AS.Model

class ButtonsModel extends Model {
    static defaultOptions() {
        return {
            population: 200, // number of buttons
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options
        Object.assign(this, ButtonsModel.defaultOptions())
    }

    setup() {
        // this.refreshPatches = false

        // this.turtles.setDefault('shape', 'circle')
        // this.turtles.setDefault('size', 1.5)
        this.turtles.setDefault('heading', 0) // override promotion to random angle

        // const population = 200 // number of buttons
        this.clusterSize = 0
        this.done = false
        this.newCluster = false

        // const cmap = ColorMap.grayColorMap(0, 100)
        // const cmap = ColorMap.grayColorMap(150, 200)
        // this.patches.ask(p => {
        //     p.setColor(cmap.randomColor())
        // })

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
        for (const v of vertices) v.color = b1.color

        this.newCluster = vertices.size > this.clusterSize
        if (this.newCluster) this.clusterSize = vertices.size

        if (this.clusterSize === this.turtles.length) {
            // this.anim.setRate(30)
            // console.log('done')
            this.done = true
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
const defaultModel = ButtonsModel

