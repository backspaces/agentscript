import Model from '/src/Model.js'
import World from '/src/World.js'
import * as util from '/src/utils.js'

export default class LifeModel extends Model {
    initialDensity = 20 // percent of active cells

    // ======================

    constructor(worldOptions = World.defaultOptions(50)) {
        super(worldOptions)
    }

    setup() {
        this.patches.ask(p => {
            p.living = util.randomFloat(100) < this.initialDensity
        })
    }

    step() {
        this.patches.ask(p => {
            p.liveNeighbors = p.neighbors.count(n => n.living)
        })
        this.patches.ask(p => {
            if (p.liveNeighbors === 3) p.living = true
            else if (p.liveNeighbors !== 2) p.living = false
        })
    }
}
