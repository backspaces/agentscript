import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import FlockModel from './FlockModel.js'

modelIO.testStartup({ FlockModel, modelIO, util })

const model = new FlockModel() // default world options
model.setup()

modelIO.testSetup(model)

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model, ['flockVectorSize'])
