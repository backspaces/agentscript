import util from '../src/util.js'
import * as modelIO from '../src/modelIO.js'
import WalkersModel from './WalkersModel.js'

modelIO.testStartup({ WalkersModel, modelIO, util })

const model = new WalkersModel() // default world.
model.setup()

modelIO.testSetup(model)

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model)
