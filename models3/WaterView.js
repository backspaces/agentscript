import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'

const patchColors = ColorMap.gradientColorMap(256, ['navy', 'aqua'])
const maxZ = 10
const useSmoothing = true // unusual to have non-crisp patches

const viewOptions = { div: 'modelDiv' } // default is document.body

function newView(model, options = {}) {
    const view = new ThreeView(model.world, Object.assign(viewOptions, options))
    view.setPatchesSmoothing(useSmoothing)
    return view
}

function drawView(model, view) {
    view.drawPatches(
        model.patches,
        p => patchColors.scaleColor(p.zpos, -maxZ, maxZ).pixel
    )

    view.render()
}

export default { newView, drawView }
