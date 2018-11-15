import {modelIO, util} from '../dist/agentscript.esm.min.js'
import WaterModel from './WaterModel.js'

util.toWindow({ WaterModel, modelIO, util })

const usingPuppeteer = navigator.userAgent === 'Puppeteer'
if (usingPuppeteer) util.randomSeed()

const options = WaterModel.defaultWorld(50)
const model = new WaterModel(options)
model.setup()

// Debugging
modelIO.printToPage('patches: ' + model.patches.length)
modelIO.printToPage('turtles: ' + model.turtles.length)
modelIO.printToPage('links: ' + model.links.length)
const { world, patches, turtles } = model
util.toWindow({ world, patches, turtles, model })

util.yieldLoop(i => {
    model.step()
    if (i % 50 === 0) model.createWave(patches.oneOf())
}, 500)

const avgZPos = patches.props('zpos').sum() / patches.length
modelIO.printToPage(`Done, final average zpos: ${avgZPos}`)
modelIO.printToPage('')
modelIO.printToPage(modelIO.sampleObj(model))

if (usingPuppeteer) {
    window.modelDone = model.modelDone = true
    window.modelSample = model.modelSample = modelIO.sampleJSON(model)
}

