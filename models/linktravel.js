import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import LinkTravelModel from './LinkTravelModel.js'

modelIO.testStartup({ LinkTravelModel, modelIO, util })

const model = new LinkTravelModel()
model.setup()

modelIO.testSetup(model)

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model)
