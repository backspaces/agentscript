const Model = AS.Model
// import util from '../src/util.js'

class WaterModel extends Model {
    setup() {
        this.strength = 57
        this.surfaceTension = 56
        this.friction = 0.99

        // this.cmap = ColorMap.gradientColorMap(256, ['navy', 'aqua'])

        this.patches.ask(p => {
            p.zpos = 0
            p.deltaZ = 0
        })
        // this.colorPatches()
    }

    step() {
        this.patches.ask(p => this.computeDeltaZ(p))
        this.patches.ask(p => this.updateZ(p))
        // this.colorPatches()
        // if (this.anim.ticks % 50 === 0) this.createWave(this.patches.oneOf())
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
        const n4 = p.neighbors4
        p.deltaZ = p.deltaZ + k * (n4.sum('zpos') - n4.length * p.zpos)
    }
    updateZ(p) {
        p.zpos = (p.zpos + p.deltaZ) * this.friction
    }
}
