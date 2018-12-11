// importScripts('../dist/agentscript.umd.js')
// importScripts('../docs/models/FireScript.js')
import { util } from '../dist/agentscript.esm.js'
import PatchesView from './PatchesView.js'
import FireModel from '../models/FireModel.js'

let model, params, patchesView

function postData() {
    const data = model.patches.props('type')
    if (params.img) {
        patchesView.installPixels(data, d => params.patchPixels[d])
        patchesView.getImageBitmap().then(img => {
            postMessage(img, [img])
            // postMessage(img)
            // if (img.height !== 0) console.log('!transferable')
        })
    } else {
        postMessage(data)
    }
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        if (params.seed) util.randomSeed(params.seed)

        if (params.img) {
            patchesView = new PatchesView(params.width, params.height)
            console.log('worker patchesView', patchesView)
        }

        const options = FireModel.defaultWorld(params.maxX, params.maxY)
        model = new FireModel(options)
        model.setup()

        console.log('worker model:', model)
        console.log('worker params', params)
        console.log('worker self:', self)
        console.log('worker message data:', e.data)

        postData()
    } else if (e.data.cmd === 'step') {
        if (model.isDone()) {
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
