import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const patchColors = ColorMap.gradientColorMap(256, ['navy', 'aqua'])
const maxZ = 10
const useSmoothing = true // unusual to have non-crisp patches

const viewOptions = {} // Default is fine.

function newView(model, options = {}) {
    const view = new TwoView(model.world, Object.assign(viewOptions, options))
    view.setPatchesSmoothing(useSmoothing)
    return view
}

function drawView(model, view) {
    view.clear()
    view.drawPatches(
        model.patches,
        p => patchColors.scaleColor(p.zpos, -maxZ, maxZ).pixel
    )
}

export default { newView, drawView }
