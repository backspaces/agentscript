import Model from '../src/Model.js'
import util from '../src/util.js'

util.toWindow({ Model, util })

const numTurtles = 10000

class TurtlesModel extends Model {
  setup () {
    this.turtles.own('speed')
    this.turtles.setDefault('atEdge', 'wrap')
    this.turtles.setDefault('z', 0.1)

    this.turtles.create(numTurtles, (t) => {
      t.size = util.randomFloat2(0.2, 0.5) // + Math.random()
      t.speed = util.randomFloat2(0.01, 0.05) // 0.5 + Math.random()
    })
  }
  step () {
    this.turtles.ask((t) => {
      t.theta += util.randomCentered(0.1)
      t.forward(t.speed)
    })
  }
}

const model = new TurtlesModel() // default world.
model.setup()

// Debugging
util.print('patches: ' + model.patches.length)
util.print('turtles: ' + model.turtles.length)
util.print('links: ' + model.links.length)
const {world, patches, turtles, links} = model
util.toWindow({ world, patches, turtles, links, model })

util.repeat(500, () => model.step())
