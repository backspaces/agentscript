import Model from '../src/Model.js'
import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'

util.toWindow({ Model, modelIO, util })

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

const usingPuppeteer = navigator.userAgent === 'Puppeteer'
if (usingPuppeteer) util.randomSeed()

const model = new TestModel() // default world.
model.setup()

// Debugging
modelIO.printToPage('patches: ' + model.patches.length)
modelIO.printToPage('turtles: ' + model.turtles.length)
modelIO.printToPage('links: ' + model.links.length)

const {world, patches, turtles, links} = model
util.toWindow({ world, patches, turtles, links, model })

// util.repeat(500, () => model.step())
util.yieldLoop(() => model.step(), 500)

modelIO.printToPage('')
modelIO.printToPage(modelIO.sampleObj(model))

if (usingPuppeteer) {
  window.modelDone = model.modelDone = true
  window.modelSample = model.modelSample = modelIO.sampleJSON(model)
}
