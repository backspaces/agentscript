import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const patchesColors = ColorMap.DarkGray
const turtleColors = ColorMap.Basic16
const shape = 'dart'
const shapeSize = 1

const viewOptions = { patchSize: 15 }

function newView(model, options = {}) {
    const view = new TwoView(model.world, Object.assign(viewOptions, options))
    // one-time initialization: Create static patch colors
    view.createPatchPixels(i => patchesColors.randomColor().pixel)
    return view
}

function drawView(model, view) {
    view.drawPatches() // redraw cached patches colors

    view.drawTurtles(model.turtles, t => ({
        shape: shape,
        color: turtleColors.atIndex(t.id).css,
        size: shapeSize,
    }))
}

export default { newView, drawView }
