import World from '../src/World.js'
import Model from '../src/Model.js'

// Derived from Cody's water model.
export default class WaterModel extends Model {
    strength = 100
    surfaceTension = 56
    friction = 0.99
    drip = 50

    // ======================

    constructor(worldOptions = World.defaultOptions(50)) {
        super(worldOptions)
    }

    setup() {
        this.patches.ask(p => {
            p.zpos = 0
            p.deltaZ = 0
        })
    }

    step() {
        if (this.ticks % this.drip === 0) this.createWave(this.patches.oneOf())
        this.patches.ask(p => this.computeDeltaZ(p))
        this.patches.ask(p => this.updateZ(p))
    }

    createWave(p) {
        p.zpos = this.strength
    }
    computeDeltaZ(p) {
        const k = 1 - 0.01 * this.surfaceTension
        const n = p.neighbors4
        p.deltaZ = p.deltaZ + k * (n.sum('zpos') - n.length * p.zpos)
    }
    updateZ(p) {
        p.zpos = (p.zpos + p.deltaZ) * this.friction
    }

    // Used by modeler for reporting stats, not needed by model itself
    averageZpos() {
        return this.patches.props('zpos').sum() / this.patches.length
    }
}
