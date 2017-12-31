import {Model, util} from '../dist/AS.module.js'

util.toWindow({ Model, util })

class TestModel extends Model {
  setup () {
    this.turtles.create(1000, (t) => {
      t.data = util.randomFloat2(0.2, 0.5) // + Math.random()
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
      t.forward(0.01)
    })
  }
}

const model = new TestModel() // default world.
model.setup()

// Debugging
console.log('patches:', model.patches.length)
console.log('turtles:', model.turtles.length)
console.log('links:', model.links.length)
util.log('patches: ' + model.patches.length)
util.log('turtles: ' + model.turtles.length)
util.log('links: ' + model.links.length)

const {world, patches, turtles, links} = model
util.toWindow({ world, patches, turtles, links, model })

util.repeat(500, () => model.step())
