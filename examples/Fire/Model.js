import World from 'https://code.agentscript.org/src/World.js'
import Model from 'https://code.agentscript.org/src/Model.js'
import * as util from 'https://code.agentscript.org/src/utils.js'

export default class FireModel extends Model {
    density = 60 // percent of patches with tree

    // ======================

    constructor(worldOptions = World.defaultOptions(125)) {
        super(worldOptions)
    }

    setup() {
        this.patchBreeds('fires embers')

        this.patchTypes = [
            'dirt',
            'tree', // fire types need to be in this order:
            'fire',
            'ember4',
            'ember3',
            'ember2',
            'ember1',
            'ember0',
        ]
        this.dirtType = this.patchTypes[0]
        this.treeType = this.patchTypes[1]
        this.fireType = this.patchTypes[2]

        this.patches.ask(p => {
            if (p.x === this.world.minX) this.ignite(p)
            else if (util.randomInt(100) < this.density) p.type = this.treeType
            else p.type = this.dirtType
        })

        this.burnedTrees = 0
        this.initialTrees = this.patches.filter(p => this.isTree(p)).length
    }

    step() {
        if (this.done) return

        this.fires.ask(p => {
            p.neighbors4.ask(n => {
                if (this.isTree(n)) this.ignite(n)
            })
            p.setBreed(this.embers)
        })
        this.fadeEmbers()

        this.done = this.fires.length + this.embers.length === 0
        if (this.done) console.log(`Model done at tick: ${this.ticks}`)
    }

    isTree(p) {
        return p.type === this.treeType
    }
    percentBurned() {
        return (this.burnedTrees / this.initialTrees) * 100
    }
    // isDone() {
    //     return this.fires.length + this.embers.length === 0
    // }

    ignite(p) {
        p.type = this.fireType
        p.setBreed(this.fires)
        this.burnedTrees++
    }

    fadeEmbers() {
        this.embers.ask(p => {
            const type = p.type
            const ix = this.patchTypes.indexOf(type)
            if (type === 'ember0') p.setBreed(this.patches)
            // sorta like die, removes from breed.
            else p.type = this.patchTypes[ix + 1]
        })
    }
}
