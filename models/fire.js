import Model from '../src/Model.js'
import util from '../src/util.js'

util.toWindow({ Model, util })

class FireModel extends Model {
  setup () {
    this.patchBreeds('fires embers')

    // this.fireColorMap = ColorMap.gradientColorMap(6, ['red', [128, 0, 0]])
    this.fireColorMap = [
      'color0', 'color1', 'color2', 'color3', 'color4', 'color5'
    ]
    this.treeColor = 'green' // Color.color(0, 255, 0)
    this.dirtColor = 'yellow' // Color.toColor('yellow')
    this.fireColor = this.fireColorMap[0]
    this.done = false

    this.density = 60 // percent
    this.patches.ask(p => {
      if (p.x === this.world.minX)
        this.ignight(p)
      else if (util.randomInt(100) < this.density)
        p.color = this.treeColor
      else
        p.color = this.dirtColor
    })

    this.burnedTrees = 0
    this.initialTrees =
      this.patches.filter(p => this.isTree(p)).length
      // this.patches.filter(p => p.color.equals(this.treeColor)).length
  }

  step () {
    if (this.done) return

    if (this.fires.length + this.embers.length === 0) {
      // console.log('Done:', this.anim.toString())
      const percentBurned = this.burnedTrees / this.initialTrees * 100
      console.log('Percent burned:', percentBurned.toFixed(2))
      util.log('Percent burned: ' + percentBurned.toFixed(2))
      this.done = true
      return // keep three control running
    }

    this.fires.ask(p => {
      p.neighbors4.ask((n) => {
        if (this.isTree(n)) this.ignight(n)
      })
      p.setBreed(this.embers)
    })
    this.fadeEmbers()
  }

  // isTree (p) { return p.color.equals(this.treeColor) }
  isTree (p) { return p.color === this.treeColor }

  ignight (p) {
    p.color = this.fireColor
    // this.fires.setBreed(p)
    p.setBreed(this.fires)
    this.burnedTrees++
  }

  fadeEmbers () {
    this.embers.ask(p => {
      const c = p.color
      const ix = this.fireColorMap.indexOf(c)
      if (ix === this.fireColorMap.length - 1)
        p.setBreed(this.patches) // sorta like die, removes from breed.
      else
        p.color = this.fireColorMap[ix + 1]
    })
  }
}

// const div = document.body
const options = Model.defaultWorld(125)
const model = new FireModel(options)
model.setup()

// Debugging
console.log('patches:', model.patches.length)
console.log('fires:', model.fires.length)
console.log('embers:', model.embers.length)
util.log('patches: ' + model.patches.length)
util.log('fires: ' + model.fires.length)
util.log('embers: ' + model.embers.length)
const {world, patches, fires, embers} = model
util.toWindow({ world, patches, fires, embers, model })

util.repeat(500, () => model.step())

console.log('fires:', model.fires.length)
console.log('embers:', model.embers.length)
util.log('fires: ' + model.fires.length)
util.log('embers: ' + model.embers.length)
