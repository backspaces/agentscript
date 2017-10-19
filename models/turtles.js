import Model from '../src/Model.js'
import util from '../src/util.js'
// import {Model, util} from '../dist/AS.module.js'

util.toWindow({ Model, util })

const numTurtles = 10000

class TurtlesModel extends Model {
  setup () {
    this.turtles.own('speed')
    this.turtles.setDefault('atEdge', 'wrap')
    this.turtles.setDefault('z', 0.1)

    // this.cmap = ColorMap.LightGray
    // this.patches.ask(p => {
    //   p.color = this.cmap.randomColor()
    // })

    this.turtles.create(numTurtles, (t) => {
      t.size = util.randomFloat2(0.2, 0.5) // + Math.random()
      t.speed = util.randomFloat2(0.01, 0.05) // 0.5 + Math.random()
    })

    // const {width, height} = this.world
    // // width = util.nextPowerOf2(width)
    // // height = util.nextPowerOf2(height)
    // this.ctx = util.createCtx(width, height)
    // this.ctx.clearRect(0, 0, width, height)
    // // initCanvasMesh (canvas, name, z, textureOptions = {}) {
    // this.view.initCanvasMesh(this.ctx.canvas, 'testMesh', 10)
  }
  step () {
    this.turtles.ask((t) => {
      t.theta += util.randomCentered(0.1)
      t.forward(t.speed)
    })
    // this.renderer.updateCanvasMesh('testMesh')
  }
}

// const renderOptions = ThreeView.defaultOptions()
const model = new TurtlesModel() // default world.
model.setup()

// Debugging
console.log('patches:', model.patches.length)
console.log('turtles:', model.turtles.length)
const {world, patches, turtles, links} = model
util.toWindow({ world, patches, turtles, links, model })
// util.toWindow({ world, patches, turtles, links, model, renderOptions })

util.repeat(500, () => model.step())
