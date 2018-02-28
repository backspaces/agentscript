import {Model, util} from '../dist/agentscript.esm.js'

util.toWindow({ Model, util })

class Hello extends Model {
  // Inherit default constructor.

  setup () {
    this.turtles.setDefault('atEdge', 'bounce')

    this.turtles.create(10, t => {
      const patch = this.patches.oneOf()
      t.setxy(patch.x, patch.y)
    })

    this.turtles.ask(t => {
      this.links.create(t, this.turtles.otherOneOf(t))
    })
  }

  step () {
    this.turtles.ask(t => {
      t.direction += util.randomCentered(0.1)
      t.forward(0.1)
    })
  }
}

const model = new Hello()
model.setup()

// Debugging
util.print('patches: ' + model.patches.length)
util.print('turtles: ' + model.turtles.length)
util.print('links: ' + model.links.length)
const {world, patches, turtles, links} = model
util.toWindow({ world, patches, turtles, links, model })

util.repeat(500, () => model.step())

const xys = turtles.map(t => [t.x, t.y])
util.print('xys: ' + util.objectToString1(xys))

// const {x, y} = turtles[0]
// util.print('turtle[0](x,y): ' + x + ' ' + y)


