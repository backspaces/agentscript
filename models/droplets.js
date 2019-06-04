import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'
import World from '../src/World.js'
import DropletsModel from './DropletsModel.js'

modelIO.testStartup({ DropletsModel, modelIO, util })

const options = World.defaultOptions(50)
const model = new DropletsModel(options)

model.startup().then(() => {
    model.setup()
    modelIO.testSetup(model)

    // const { png, elevation, dzdx, dzdy, slope, aspect, localMins } = model
    // util.toWindow({ png, elevation, dzdx, dzdy, slope, aspect, localMins })
    // ;['elevation', 'aspect', 'slope', 'dzdx', 'dzdy'].forEach(str => {
    //     util.logHistogram(str, model[str].data)
    // })

    util.yieldLoop(() => {
        model.step()
        model.tick()
    }, 500)

    modelIO.testDone(model)
})
