import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import HelloModel from './HelloModel.js'

util.toWindow({ HelloModel, modelIO, util })

const usingPuppeteer = navigator.userAgent === 'Puppeteer'
if (usingPuppeteer) util.randomSeed()

const model = new HelloModel()
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

// if (!usingPuppeteer) runModel()
// else window.runModel = runModel

// const {x, y} = turtles[0]
// modelIO.printToPage('turtle[0](x,y): ' + x + ' ' + y)
