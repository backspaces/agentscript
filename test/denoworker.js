import { runModel, sampleModel } from '../src/utils.js'

self.onmessage = async e => {
    const { name, path } = e.data
    console.log(name, path)

    const model = await runModel(path, 500, true)
    const result = sampleModel(model)

    self.postMessage({ name, result })
    self.close()
}
