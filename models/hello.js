import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import HelloModel from './HelloModel.js'

modelIO.testStartup({ HelloModel, modelIO, util })

const model = new HelloModel() // default world options
model.setup()

modelIO.testSetup(model)

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model)
