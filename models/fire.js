import Model from '../src/Model.js'
import util from '../src/util.js'

util.toWindow({ Model, util })

class FireModel extends Model {
  setup () {
    this.patchBreeds('fires embers')

    this.patchTypes = [
      'dirt', 'tree', // fire types need to be in this order:
      'fire', 'ember4', 'ember3', 'ember2', 'ember1', 'ember0'
    ]
    this.dirtType = this.patchTypes[0]
    this.treeType = this.patchTypes[1]
    this.fireType = this.patchTypes[2]

    this.density = 60 // percent
    this.patches.ask(p => {
      if (p.x === this.world.minX)
        this.ignight(p)
      else if (util.randomInt(100) < this.density)
        p.type = this.treeType
      else
        p.type = this.dirtType
    })

    this.burnedTrees = 0
    this.initialTrees =
      this.patches.filter(p => this.isTree(p)).length
  }

  step () {
    this.fires.ask(p => {
      p.neighbors4.ask((n) => {
        if (this.isTree(n)) this.ignight(n)
      })
      p.setBreed(this.embers)
    })
    this.fadeEmbers()
  }

  isTree (p) { return p.type === this.treeType }
  percentBurned () { return this.burnedTrees / this.initialTrees * 100 }
  isDone () { return this.fires.length + this.embers.length === 0 }

  ignight (p) {
    p.type = this.fireType
    p.setBreed(this.fires)
    this.burnedTrees++
  }

  fadeEmbers () {
    this.embers.ask(p => {
      const type = p.type
      const ix = this.patchTypes.indexOf(type)
      // if (ix === this.patchTypes.length - 1)
      if (type === 'ember0')
        p.setBreed(this.patches) // sorta like die, removes from breed.
      else
        p.type = this.patchTypes[ix + 1]
    })
  }
}

// const div = document.body
const options = Model.defaultWorld(125)
const model = new FireModel(options)
model.setup()

// Debugging
util.print('patches: ' + model.patches.length)
util.print('turtles: ' + model.turtles.length)
util.print('links: ' + model.links.length)
util.print('fires: ' + model.fires.length)
util.print('embers: ' + model.embers.length)
const {world, patches, fires, embers} = model
util.toWindow({ world, patches, fires, embers, model })

util.repeat(500, () => model.step())

util.print('')
util.print('isDone: ' + model.isDone())
util.print('fires: ' + model.fires.length)
util.print('embers: ' + model.embers.length)
util.print('initialTrees: ' + model.initialTrees)
util.print('burnedTrees: ' + model.burnedTrees)
util.print('percentBurned: ' + model.percentBurned().toFixed(2))
