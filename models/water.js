import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import World from '../src/World.js'
import WaterModel from './WaterModel.js'

modelIO.testStartup({ WaterModel, modelIO, util })

const options = World.defaultOptions(50)
const model = new WaterModel(options)
model.setup()

modelIO.testSetup(model)

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model, ['averageZpos'])
