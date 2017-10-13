import Model from '../src/Model.js'
import util from '../src/util.js'
// import {Model, util} from '../dist/AS.module.js'

util.toWindow({ Model, util })

class LinksModel extends Model {
  setup () {
    this.turtles.setDefault('atEdge', 'bounce')

    this.patches.ask(p => {
      p.data = util.randomFloat(100)
    })

    this.turtles.create(1000, (t) => {
      t.size = util.randomFloat2(0.2, 0.5) // + Math.random()
      t.speed = util.randomFloat2(0.01, 0.05) // 0.5 + Math.random()
    })

    this.turtles.ask(turtle => {
      const other = this.turtles.otherOneOf(turtle)
      if (turtle.links.length === 0 || other.links.length === 0)
        this.links.create(turtle, other, (link) => {
          link.data = util.randomInt(100)
        })
    })
  }
  step () {
    this.turtles.ask((t) => {
      t.theta += util.randomCentered(0.1)
      t.forward(t.speed)
    })
  }
}

const model = new LinksModel(document.body)
model.setup()

// Debugging
console.log('patches:', model.patches.length)
console.log('turtles:', model.turtles.length)
console.log('links:', model.links.length)
const {world, patches, turtles, links} = model
util.toWindow({ world, patches, turtles, links, model })

util.repeat(50, () => model.step())
