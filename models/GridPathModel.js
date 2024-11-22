import AgentArray from 'https://code.agentscript.org/src/AgentArray.js'
import Model from 'https://code.agentscript.org/src/Model.js'

// prettier-ignore
const WorldOptions = {
    minX: 0, maxX: 9,
    minY: 0, maxY: 9,
    minZ: 0, maxZ: 2,
}

export default class GridPathModel extends Model {
    constructor(worldOptions = WorldOptions) {
        super(worldOptions) // default world options if "undefined"
    }

    setup() {
        this.probability = 1
        this.patches.ask(p => (p.occupied = false))
        this.walker = this.turtles.createOne()
        this.walker.moveTo(this.patches.first())
        this.walker.patch.occupied = true
        // this.walker.choices = 2 // used by view to show the number of choices
    }

    step() {
        if (this.done) return

        this.floodFill()

        const ok = this.okNeighbors(this.walker.patch)
        this.walker.choices = ok.length

        let turtle = this.walker.hatch()[0]
        ;[this.walker, turtle] = [turtle, this.walker]

        this.walker.moveTo(ok.oneOf())
        this.walker.patch.occupied = true

        this.links.createOne(this.walker, turtle)

        this.probability /= ok.length

        this.done = this.patches.last().occupied

        if (this.done) {
            this.walker.choices = this.okNeighbors(this.walker.patch).length
            console.log(`Model done at tick: ${this.ticks}`)
        }
    }

    // isDone() {
    //     return this.patches.last().occupied
    // }
    okNeighbors(p) {
        return p.neighbors4.filter(p => p.ok)
    }

    floodFill() {
        this.patches.ask(p => (p.ok = false))
        let pset = new AgentArray(this.patches.last())
        let step = 0
        while (pset.length > 0) {
            pset.ask(p => (p.ok = true))
            pset.ask(p => (p.step = step))
            let pnext = pset
                .map(p => p.neighbors4)
                .flat()
                .uniq()
            pset = pnext.filter(n => !n.ok && !n.occupied)
            step++
        }
    }
}
