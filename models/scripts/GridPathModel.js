var AgentArray = AS.AgentArray
var Model = AS.Model

class GridPathModel extends Model {
    static defaultOptions() {
        return {
            // No programmable variables
        }
    }

    // ======================

    constructor(
        worldOptions = {
            minX: 0,
            minY: 0,
            maxX: 9,
            maxY: 9,
        }
    ) {
        super(worldOptions) // default world options if "undefined"
        Object.assign(this, GridPathModel.defaultOptions())
    }

    setup() {
        this.probability = 1
        this.patches.ask(p => (p.occupied = false))
        this.walker = this.turtles.createOne()
        this.walker.moveTo(this.patches.first())
        this.walker.patch.occupied = true
    }

    step() {
        if (this.done()) return
        this.floodFill()

        const ok = this.okNeighbors(this.walker.patch)
        let turtle = this.walker.hatch()[0]
        ;[this.walker, turtle] = [turtle, this.walker]
        this.walker.moveTo(ok.oneOf())
        this.walker.patch.occupied = true
        this.links.createOne(this.walker, turtle)

        this.probability /= ok.length
    }

    done() {
        return this.patches.last().occupied
    }
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
            // let pnext = Array.from(new Set(pset.map(p => p.neighbors4).flat()))
            let pnext = pset
                .map(p => p.neighbors4)
                .flat()
                .uniq()
            pset = pnext.filter(n => !n.ok && !n.occupied)
            step++
        }
    }
}
const defaultModel = GridPathModel

