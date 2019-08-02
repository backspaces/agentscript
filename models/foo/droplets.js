import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import World from '../src/World.js'
import DropletsModel from './DropletsModel.js'

modelIO.testStartup({ DropletsModel, modelIO, util })

// const options = World.defaultOptions(50)
const model = new DropletsModel()

model.startup().then(() => {
    model.setup()
    modelIO.testSetup(model)

    util.yieldLoop(() => {
        model.step()
        model.tick()
    }, 500)

    modelIO.testDone(model)
})
