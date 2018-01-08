import {DataSet, Model, util} from '../dist/AS.module.js'

util.toWindow({ DataSet, Model, util })

class DiffuseModel extends Model {
  setup () {
    // this.patches.own('ran ds')
    this.turtles.setDefault('speed', 0.5)
    this.turtles.setDefault('atEdge', 'wrap')
    this.turtles.setDefault('size', 5)
    this.population = 2
    this.radius = 6

    this.patches.ask(p => {
      p.ran = util.randomFloat(1.0)
      p.ds = 0
    })

    this.patches.nOf(this.population).ask(p => {
      p.sprout(1, this.turtles)
    })
  }
  step () {
    this.turtles.ask((t) => {
      t.theta += util.randomCentered(0.1)
      t.forward(t.speed)
      this.patches.inRadius(t.patch, this.radius, true).ask(p => {
        p.ran = Math.min(p.ran + 0.1, 0.8)
      })
    })

    this.patches.diffuse('ran', 0.05)
  }
}

const options = Model.defaultWorld(200, 100)
const model = new DiffuseModel(options)
model.setup()

//  Debugging
util.print('patches: ' + model.patches.length)
util.print('turtles: ' + model.turtles.length)
util.print('links: ' + model.links.length)
const {world, patches, turtles, links} = model
util.toWindow({ world, patches, turtles, links, model })

util.repeat(500, () => model.step())
