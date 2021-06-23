import Model from '../src/Model.js'
import World from '../src/World.js'
import * as util from '../src/utils.js'

export default class LifeModel extends Model {
    population = 10 // number of turtles
    initialDensity = 30 // percent of active cells

    // ======================

    constructor(worldDptions = World.defaultOptions(50)) {
        super(worldDptions)
    }

    setup() {
        this.patches.ask(p => {
            p.living = util.randomFloat(100) < this.initialDensity
            p.liveNeighbors = 0
        })
    }

    get density() {
        const living = this.patches.with(p => p.living).length
        return living / this.patches.length
    }

    step() {
        //
        this.patches.ask(p => {
            p.liveNeighbors = p.neighbors.with(n => n.living).length
        })
        this.patches.ask(p => {
            if (p.liveNeighbors === 3) p.living = true
            else if (p.liveNeighbors !== 2) p.living = false
        })

        // console.log(this.density)
    }
}

// export default LifeModel
