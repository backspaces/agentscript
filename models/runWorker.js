import util from '../src/util.js'

let model, params

// function postData() {
//     const data = {
//         patches: model.patches.typedSample({
//             isNest: Uint8Array, // bool: 0 = false, 1 = true
//             isFood: Uint8Array,
//             foodPheromone: Float32Array,
//             nestPheromone: Float32Array,
//         }),
//         turtles: model.turtles.typedSample({
//             x: Float32Array,
//             y: Float32Array,
//             theta: Float32Array,
//         }),
//     }
//     postMessage(data, util.oofaBuffers(data))
//     model.tick()
// }

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        console.log('worker: params', params)

        async function run() {
            const module = await import(params.classPath)
            const Model = module.default

            if (params.seed) util.randomSeed()

            model = new Model()
            console.log('worker: params', params, 'model:', model)

            await model.startup()
            model.setup()
            util.repeat(params.steps, () => {
                model.step()
                model.tick()
            })
            console.log('worker: done, model', model)

            postMessage(util.sampleModel(model))
        }
        run()

        // postData()
        // } else if (e.data.cmd === 'step') {
        //     if (model.ticks < params.steps) {
        //         model.step()
        //         postData()
        //     } else {
        //         postMessage('done')
        //     }
    } else {
        console.log('Oops, unknown message: ', e)
    }
}
