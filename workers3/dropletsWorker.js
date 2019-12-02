import util from '../src/util.js'
import DataSet from '../src/DataSet.js'
import DropletsModel from '../models/DropletsModel.js'
console.log('worker self', self)

let model, params

function postData() {
    const data = {
        turtles: model.turtles.typedSample({
            x: Float32Array,
            y: Float32Array,
            theta: Float32Array,
        }),
    }
    if (model.ticks === 0) {
        data.patches = model.patches.typedSample({
            elevation: Float32Array,
        })
        const localMinIDs = model.localMins.map(p => p.id)
        data.model = { localMins: Uint32Array.from(localMinIDs) }
        console.log('data', data)
    }
    postMessage(data, util.oofaBuffers(data))
    model.tick()
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        const { width, height, data } = e.data.params.elevation
        params.elevation = new DataSet(width, height, data)
        if (params.seed) util.randomSeed()
        model = new DropletsModel(params.world)
        // model.tile = params.tile
        // model.startup().then(() => {
        model.installDataSets(params.elevation)
        model.setup()
        console.log('worker: params', params, 'model:', model)
        postData()
        // })
    } else if (e.data.cmd === 'step') {
        if (model.ticks < params.steps) {
            model.step()
            postData()
        } else {
            postMessage('done')
        }
    } else {
        console.log('Oops, unknown message: ', e)
    }
}
