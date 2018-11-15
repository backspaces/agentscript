import {modelIO, util} from '../dist/agentscript.esm.min.js'
import FlockModel from './FlockModel.js'

util.toWindow({ FlockModel, modelIO, util })

const usingPuppeteer = navigator.userAgent === 'Puppeteer'
if (usingPuppeteer) util.randomSeed()

const model = new FlockModel() // default world.
model.setup()

// Debugging
modelIO.printToPage('patches: ' + model.patches.length)
modelIO.printToPage('turtles: ' + model.turtles.length)
modelIO.printToPage('links: ' + model.links.length)
const { world, patches, turtles } = model
util.toWindow({ world, patches, turtles, model })

modelIO.printToPage('initial flockVectorSize: ' + model.flockVectorSize())
// util.repeat(500, () => model.step())
util.yieldLoop(() => model.step(), 500)

modelIO.printToPage('')
modelIO.printToPage('final flockVectorSize: ' + model.flockVectorSize())

modelIO.printToPage('')
modelIO.printToPage(modelIO.sampleObj(model))

if (usingPuppeteer) {
    window.modelDone = model.modelDone = true
    window.modelSample = model.modelSample = modelIO.sampleJSON(model)
}

