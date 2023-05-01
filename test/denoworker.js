import { runModel, sampleModel } from '../src/utils.js'
import {
    createCanvas,
    loadImage,
} from 'https://deno.land/x/canvas@v1.4.1/mod.ts'
Object.assign(globalThis, { createCanvas, loadImage })

self.onmessage = async e => {
    const { name, path } = e.data
    console.log(name, path)

    const model = await runModel(path, 500, true)
    const result = sampleModel(model)

    self.postMessage({ name, result })
    self.close()
}
