import ColorMap from '../src/ColorMap.js'
import ThreeDraw from '../src/ThreeDraw.js'

const patchColors = ColorMap.gradientColorMap(256, ['navy', 'aqua'])
const maxZ = 10

export default function newView(model, viewOptions = {}) {
    const drawOptions = {
        patchesColor: p => patchColors.scaleColor(p.zpos, -maxZ, maxZ).pixel,
    }

    const view = new ThreeDraw(model, viewOptions, drawOptions)
    view.setPatchesSmoothing(true)
    return view
}
