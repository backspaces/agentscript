import { runModel, sampleModel, pause } from '../src/utils.js'

// console.log('worker runModel, sampleModel', runModel, sampleModel)

// https:/deno.land/manual/runtime/workers
await pause(1000)

self.onmessage = async e => {
    const { name, path } = e.data
    console.log('worker', name, path)

    const model = await runModel(path, 500, true)
    const result = sampleModel(model)

    self.postMessage({ name, result })
    self.close()
}
