import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const patchColors = ColorMap.Rgb256

const useSmoothing = true // unusual to have non-crisp patches
const shape = 'dart'
const shapeSize = 8

const viewOptions = { patchSize: 3 }

function newView(model, options = {}) {
    const view = new TwoView(model.world, Object.assign(viewOptions, options))
    view.setPatchesSmoothing(useSmoothing)
    return view
}

function drawView(model, view) {
    view.clear()
    view.drawPatches(
        model.patches,
        p => patchColors.scaleColor(p.ran, 0, 1).pixel
    )
    view.drawTurtles(model.turtles, t => ({
        shape: shape,
        color: 'red',
        size: shapeSize,
    }))
}

export default { newView, drawView }
