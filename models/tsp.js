import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import TSPModel from './TSPModel.js'

util.toWindow({ TSPModel, modelIO, util })

const usingPuppeteer = navigator.userAgent === 'Puppeteer'
if (usingPuppeteer) util.randomSeed()

const options = TSPModel.defaultWorld(50)
const model = new TSPModel(options)
model.setup()

// Debugging
modelIO.printToPage('patches: ' + model.patches.length)
modelIO.printToPage('turtles: ' + model.turtles.length)
modelIO.printToPage('links: ' + model.links.length)
const { world, patches, turtles } = model
util.toWindow({ world, patches, turtles, model })

util.yieldLoop(i => {
    model.step()
}, 5000)

modelIO.printToPage(
    `Done, best tour: ${model.bestTourLength} at tick ${model.bestTourTick}`
)
modelIO.printToPage('')
modelIO.printToPage(modelIO.sampleObj(model))

if (usingPuppeteer) {
    window.modelDone = model.modelDone = true
    window.modelSample = model.modelSample = modelIO.sampleJSON(model)
}
