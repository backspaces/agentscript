import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import World from '../src/World.js'
import ExitModel from './ExitModel.js'

modelIO.testStartup({ ExitModel, modelIO, util })

const options = World.defaultOptions(35)
const model = new ExitModel(options)
model.setup()

modelIO.testSetup(model)

const { exits, inside, wall } = model
util.toWindow({ exits, inside, wall })

util.yieldLoop(() => {
    model.step()
    model.tick()
}, 500)

modelIO.testDone(model, ['turtles'])
