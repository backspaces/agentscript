var World = AS.World
var Model = AS.Model
// import util from '../src/util.js'

class WaterModel extends Model {
    static defaultOptions() {
        return {
            strength: 100,
            surfaceTension: 56,
            friction: 0.99,
            drip: 50,
        }
    }

    // ======================

    constructor(worldDptions = World.defaultOptions(50)) {
        super(worldDptions)
        Object.assign(this, WaterModel.defaultOptions())
    }
    setup() {
        // this.cmap = ColorMap.gradientColorMap(256, ['navy', 'aqua'])

        this.patches.ask(p => {
            p.zpos = 0
            p.deltaZ = 0
        })
        // this.colorPatches()
    }

    step() {
        if (this.ticks % this.drip === 0) this.createWave(this.patches.oneOf())
        this.patches.ask(p => this.computeDeltaZ(p))
        this.patches.ask(p => this.updateZ(p))
        // this.colorPatches()
    }

    createWave(p) {
        p.zpos = this.strength
    }
    // colorPatches() {
    //     const maxWater = 10
    //     this.patches.ask(p => {
    //         p.color = this.cmap.scaleColor(p.zpos, -maxWater, maxWater)
    //     })
    // }
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
const defaultModel = WaterModel

