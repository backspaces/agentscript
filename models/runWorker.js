import * as util from '../src/utils.js'
import DataSet from '../src/DataSet.js'

let model, params

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        if (util.isDataSet(params.startup)) {
            const { data, width, height } = params.startup
            params.startup = new DataSet(width, height, data)
        }
        console.log('worker: params', params)

        async function run() {
            const module = await import(params.classPath)
            const Model = module.default

            if (params.seed) util.randomSeed()

            model = new Model()
            console.log('model:', model)

            await model.startup(params.startup)
            model.setup()
            util.repeat(params.steps, () => {
                model.step()
            })
            console.log('worker: done, model', model)

            postMessage(util.sampleModel(model))
        }
        run() // don't await, stops worker
    } else {
        console.log('Oops, unknown message: ', e)
    }
}
