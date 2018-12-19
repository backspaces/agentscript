// importScripts('../dist/agentscript.umd.js')
// importScripts('../docs/models/FireScript.js')
import util from '../src/util.js'
import Shapes from '../src/Shapes.js'
import FlockModel from '../models/FlockModel.js'

let model, params, flockModel

function postData() {
    const data = model.turtles.propsObjects('x y theta', false)
    if (params.img) {
        // patchesView.installPixels(data, d => params.patchPixels[d])
        // patchesView.getImageBitmap().then(img => {
        //     postMessage(img, [img])
        //     // postMessage(img)
        //     // if (img.height !== 0) console.log('!transferable')
        // })
    } else {
        postMessage(data)
    }
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        if (params.seed) util.randomSeed(params.seed)

        // if (params.img) {
        //     patchesView = new PatchesView(params.width, params.height)
        //     console.log('worker patchesView', patchesView)
        // }

        const options = FlockModel.defaultWorld(params.maxX, params.maxY)
        model = new FlockModel(options)
        model.setup()

        console.log('worker model:', model)
        console.log('worker params', params)
        console.log('worker self:', self)
        console.log('worker message data:', e.data)

        postData()
    } else if (e.data.cmd === 'step') {
        if (model.flockVectorSize() > params.done) {
            postMessage('done')
        } else {
            model.step()
            postData()
        }
        // } else if (e.data.cmd === 'script') {
        //     importScripts(e.data.url)
    } else {
        console.log('Oops, unknown message: ', e)
    }
}
