import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import World from '../src/World.js'
import RoadsModel from './RoadsModel.js'

modelIO.testStartup({ RoadsModel, modelIO, util })

// const options = World.defaultOptions(100)
const model = new RoadsModel()

model.startup().then(() => {
    model.setup()
    modelIO.testSetup(model)

    util.yieldLoop(() => {
        model.step()
        model.tick()
    }, 500)

    modelIO.testDone(model)
})
