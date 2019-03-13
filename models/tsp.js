import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import TSPModel from './TSPModel.js'

modelIO.testStartup({ TSPModel, modelIO, util })

const options = TSPModel.defaultWorld(50)
const model = new TSPModel(options)
model.setup()

modelIO.testSetup(model)

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model, ['bestTourLength', 'bestTourTick'])
