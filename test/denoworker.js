import { runModel, sampleModel } from '../src/utils.js'
import * as skiaCanvas from 'https://deno.land/x/skia_canvas@0.5.4/mod.ts'

const { Image, createCanvas } = skiaCanvas
Object.assign(globalThis, { Image, createCanvas })

self.postMessage('init')
console.log('worker: init sent')

self.onmessage = async e => {
    console.log('worker: msg received', e.data)
    const { name, path } = e.data

    const model = await runModel(path, 500, true)
    console.log('worker: runModel completed')
    const result = sampleModel(model)

    self.postMessage({ name, result })
    self.close()
}
