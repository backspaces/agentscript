import FireModel from '../models/FireModel.js'
import PatchesView from './PatchesView.js'

// util.randomSeed(1) // for consistant results over runs

// util.toWindow({ patchesView, patchPixels })

let model, patchesView

const patchPixels = {
    dirt: PatchesView.cssToPixel('yellow'),
    tree: PatchesView.cssToPixel('green'),
    fire: PatchesView.cssToPixel('red'),
    ember4: PatchesView.rgbaToPixel(255 - 25, 0, 0),
    ember3: PatchesView.rgbaToPixel(255 - 50, 0, 0),
    ember2: PatchesView.rgbaToPixel(255 - 75, 0, 0),
    ember1: PatchesView.rgbaToPixel(255 - 100, 0, 0),
    ember0: PatchesView.rgbaToPixel(255 - 125, 0, 0),
}
function postBits() {
    const data = model.patches.props('type')
    patchesView.installPixels(data, d => patchPixels[d])
    // const img = createImageBitmap(patchesView.imageData)
    patchesView.getImageBitmap().then(img => postMessage(img, [img]))
    // createImageBitmap(patchesView.imageData).then(img => postMessage(img))
}

onmessage = e => {
    // console.log('worker onmessage e.data = ', e.data)
    if (e.data.cmd === 'init') {
        const maxX = e.data.size
        const width = 2 * maxX + 1

        const options = FireModel.defaultWorld(maxX)
        model = new FireModel(options)
        model.setup()
        console.log('worker model:', model)
        console.log('worker self:', self)
        console.log('worker message data:', e.data)

        patchesView = new PatchesView(width, width)

        postBits()
    } else if (e.data.cmd === 'step') {
        if (model.isDone()) {
            postMessage('done')
        } else {
            model.step()
            postBits()
        }
    } else {
        console.log('Oops, unknown message: ', e)
    }
}
