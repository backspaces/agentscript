import {modelIO, util} from '../dist/agentscript.esm.min.js'
import FireModel from './FireModel.js'

util.toWindow({ FireModel, modelIO, util })

const usingPuppeteer = navigator.userAgent === 'Puppeteer'
if (usingPuppeteer) util.randomSeed()

// const div = document.body
const options = FireModel.defaultWorld(125)
const model = new FireModel(options)
model.setup()

// Debugging
modelIO.printToPage('patches: ' + model.patches.length)
modelIO.printToPage('turtles: ' + model.turtles.length)
modelIO.printToPage('links: ' + model.links.length)
modelIO.printToPage('fires: ' + model.fires.length)
modelIO.printToPage('embers: ' + model.embers.length)
const { world, patches, fires, embers } = model
util.toWindow({ world, patches, fires, embers, model })

// util.repeat(500, () => model.step())
util.yieldLoop(() => model.step(), 500)

modelIO.printToPage('')
modelIO.printToPage('isDone: ' + model.isDone())
modelIO.printToPage('fires: ' + model.fires.length)
modelIO.printToPage('embers: ' + model.embers.length)
modelIO.printToPage('initialTrees: ' + model.initialTrees)
modelIO.printToPage('burnedTrees: ' + model.burnedTrees)
modelIO.printToPage('percentBurned: ' + model.percentBurned().toFixed(2))

modelIO.printToPage('')
modelIO.printToPage(modelIO.sampleObj(model))

if (usingPuppeteer) {
    window.modelDone = model.modelDone = true
    window.modelSample = model.modelSample = modelIO.sampleJSON(model)
}

