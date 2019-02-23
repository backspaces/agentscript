import util from '../src/util.js'
import HelloModel from '../models/HelloModel.js'
console.log('worker self', self)

let model, params
let steps = 0

function postData() {
    const data = {
        turtles: model.turtles.propsObject({
            x: Float32Array,
            y: Float32Array,
            theta: Float32Array,
        }),
        links: model.links.propsObject({
            x0: Float32Array,
            y0: Float32Array,
            x1: Float32Array,
            y1: Float32Array,
        }),
    }
    postMessage(data, [
        data.turtles.x.buffer,
        data.turtles.y.buffer,
        data.turtles.theta.buffer,
        data.links.x0.buffer,
        data.links.y0.buffer,
        data.links.x1.buffer,
        data.links.y1.buffer,
    ])
    if (data.turtles.x.length !== 0) console.log('to data', data)
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        if (params.seed != null) util.randomSeed(params.seed)

        model = new HelloModel(params.world)
        model.population = params.population
        model.setup()

        console.log('worker: params', params)
        console.log('worker: model:', model)
        postData()
    } else if (e.data.cmd === 'step') {
        if (++steps === params.steps) {
            postMessage('done')
        } else {
            model.step()
            postData()
        }
    } else {
        console.log('Oops, unknown message: ', e)
    }
}
