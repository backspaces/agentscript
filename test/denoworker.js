import { runModel, sampleModel } from '../src/utils.js'
// import * as skiaCancvas from 'https://deno.land/x/skia_canvas@0.5.2/mod.ts'
// Object.assign(globalThis, { skia.Image, skia.createCanvas, skia })

self.onmessage = async e => {
    console.log('worker msg', e.data)
    const { name, path } = e.data
    // console.log('worker msg', name, path)

    const model = await runModel(path, 500, true)
    const result = sampleModel(model)

    self.postMessage({ name, result })
    self.close()
}

// self.onmessage = e => {
//     // console.log('worker msg', e.data)
//     const { name, path } = e.data
//     console.log('worker msg', name, path)

//     runModel(path, 500, true).then(model => {
//         const result = sampleModel(model)
//         self.postMessage({ name, result })
//         self.close()
//     })
// }
