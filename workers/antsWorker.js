import util from '../src/util.js'
import AntsModel from '../models/AntsModel.js'
console.log('worker self', self)

let model, params

function postData() {
    const data = {
        patches: model.patches.typedSample({
            isNest: Uint8Array, // bool: 0 = false, 1 = true
            isFood: Uint8Array,
            foodPheromone: Float32Array,
            nestPheromone: Float32Array,
        }),
        turtles: model.turtles.typedSample({
            x: Float32Array,
            y: Float32Array,
            theta: Float32Array,
        }),
    }
    postMessage(data, util.oofaBuffers(data))
    model.tick()
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        if (params.seed != null) util.randomSeed(params.seed)

        model = new AntsModel(params.world)
        model.population = params.population
        model.setup()

        console.log('worker: params', params, 'model:', model)
        postData()
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
