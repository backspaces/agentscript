import util from '../src/util.js'
import ColorMap from '../src/ColorMap.js'
import PatchesView from '../src/PatchesView.js'
import WaterModel from '../models/WaterModel.js'

let model, params, patchesView, cmap

function postData() {
    const usePixels = params.img || params.pixels

    let data = model.patches.props('zpos')
    data = usePixels
        ? new Uint32Array(
            data.map(z => cmap.scaleColor(z, -params.maxZ, params.maxZ).pixel)
        )
        : new Float32Array(data)

    if (params.img) {
        patchesView.installData(data)
        patchesView.getImageBitmap().then(img => {
            postMessage(img, [img])
            if (img.height !== 0) console.log('!transferable')
        })
    } else {
        postMessage(data, [data.buffer])
    }
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        if (params.seed) util.randomSeed(params.seed)
        cmap = ColorMap.basicColorMap(params.cmap)

        if (params.img) {
            const { width, height } = params.world
            patchesView = new PatchesView(width, height)
        }

        // const options = WaterModel.defaultWorld(params.maxX, params.maxY)
        model = new WaterModel(params.world)
        model.setup()
        model.tick() // because we post data here

        console.log('worker params & model:', params, model)

        postData()
    } else if (e.data.cmd === 'step') {
        if (model.ticks < params.steps) {
            model.step()
            model.tick()
            postData()
        } else {
            postMessage('done')
        }
    } else {
        console.log('Oops, unknown message: ', e)
    }
}
