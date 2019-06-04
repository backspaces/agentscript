import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import World from '../src/World.js'
import DiffuseModel from './DiffuseModel.js'

modelIO.testStartup({ DiffuseModel, modelIO, util })

const options = World.defaultOptions(200, 100)
const model = new DiffuseModel(options)
model.setup()

modelIO.testSetup(model)

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model)
