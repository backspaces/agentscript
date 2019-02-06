import Model from '../src/Model.js'
import * as modelIO from '../src/modelIO.js'
import WalkersModel from './WalkersModel.js'
import util from '../src/util.js'

util.toWindow({ Model, modelIO, util })

// const numTurtles = 10000

// class TurtlesModel extends Model {
//     setup() {
//         this.turtles.own('speed')
//         this.turtles.setDefault('atEdge', 'wrap')
//         this.turtles.setDefault('z', 0.1)

//         this.turtles.create(numTurtles, t => {
//             // t.size = util.randomFloat2(0.2, 0.5) // + Math.random()
//             t.speed = util.randomFloat2(0.01, 0.05) // 0.5 + Math.random()
//         })
//     }
//     step() {
//         this.turtles.ask(t => {
//             t.theta += util.randomCentered(0.1)
//             t.forward(t.speed)
//         })
//     }
// }

const usingPuppeteer = navigator.userAgent === 'Puppeteer'
if (usingPuppeteer) util.randomSeed()

const model = new WalkersModel() // default world.
model.setup()

// Debugging
modelIO.printToPage('patches: ' + model.patches.length)
modelIO.printToPage('turtles: ' + model.turtles.length)
modelIO.printToPage('links: ' + model.links.length)
const { world, patches, turtles, links } = model
util.toWindow({ world, patches, turtles, links, model })

// util.repeat(500, () => model.step())
util.yieldLoop(() => model.step(), 500)

modelIO.printToPage('')
modelIO.printToPage(modelIO.sampleObj(model))

if (usingPuppeteer) {
    window.modelDone = model.modelDone = true
    window.modelSample = model.modelSample = modelIO.sampleJSON(model)
}
