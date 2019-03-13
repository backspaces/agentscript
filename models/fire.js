import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import FireModel from './FireModel.js'

modelIO.testStartup({ FireModel, modelIO, util })

// const div = document.body
const options = FireModel.defaultWorld(125)
const model = new FireModel(options)
model.setup()

modelIO.testSetup(model)

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model, [
    'fires',
    'embers',
    'initialTrees',
    'burnedTrees',
    'percentBurned',
])
