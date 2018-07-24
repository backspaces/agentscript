const {Model, util} = AS

class FireModel extends Model {
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

        this.density = 60 // percent
        // this.patches.askSet(p => { // patches static, askSet === ask
        this.patches.ask(p => {
            if (p.x === this.world.minX) this.ignight(p)
            else if (util.randomInt(100) < this.density) p.type = this.treeType
            else p.type = this.dirtType
        })

        this.burnedTrees = 0
        this.initialTrees = this.patches.filter(p => this.isTree(p)).length
    }

    step() {
        // this.fires.askSet(p => {
        this.fires.ask(p => {
            // AgentArray, vanilla ask
            p.neighbors4.ask(n => {
                if (this.isTree(n)) this.ignight(n)
            })
            p.setBreed(this.embers)
        })
        this.fadeEmbers()
    }

    isTree(p) {
        return p.type === this.treeType
    }
    percentBurned() {
        return this.burnedTrees / this.initialTrees * 100
    }
    isDone() {
        return this.fires.length + this.embers.length === 0
    }

    ignight(p) {
        p.type = this.fireType
        p.setBreed(this.fires)
        this.burnedTrees++
    }

    fadeEmbers() {
        // this.embers.askSet(p => { // same stats, done faster! 500 mutations
        this.embers.ask(p => {
            const type = p.type
            const ix = this.patchTypes.indexOf(type)
            // if (ix === this.patchTypes.length - 1)
            if (type === 'ember0') p.setBreed(this.patches)
            // sorta like die, removes from breed.
            else p.type = this.patchTypes[ix + 1]
        })
    }
}

