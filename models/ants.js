import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import World from '../src/World.js'
import AntsModel from './AntsModel.js'

modelIO.testStartup({ AntsModel, modelIO, util })

// const options = World.defaultOptions(40)
const model = new AntsModel()
model.setup()

modelIO.testSetup(model)

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model)
