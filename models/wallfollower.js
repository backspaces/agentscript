import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import WallFollowerModel from './WallFollowerModel.js'

modelIO.testStartup({ WallFollowerModel, modelIO, util })

const options = WallFollowerModel.defaultWorld(35)
const model = new WallFollowerModel(options)
model.setup()

modelIO.testSetup(model)

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model)
