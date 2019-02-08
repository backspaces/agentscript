importScripts('../dist/agentscript.umd.js')
importScripts('../models/WalkersScript.js')
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
    }
    postMessage(data, [
        data.turtles.x.buffer,
        data.turtles.y.buffer,
        data.turtles.theta.buffer,
    ])
    if (data.turtles.x.length !== 0) {
        console.log('Oops, data not transferable', data)
    }
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        if (params.seed != null) util.randomSeed(params.seed)

        model = new WalkersModel(params.world)
        model.population = params.population
        model.speed = params.speed
        model.speedDelta = params.speedDelta
        model.wiggle = params.wiggle
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
