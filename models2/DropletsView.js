import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const shape = 'circle'
const shapeColor = 'yellow'
const shapeSize = 0.5
const grayColorMap = ColorMap.grayColorMap()
const localMinColor = Color.typedColor(255, 0, 0) // 'red'

const viewOptions = { useSprites: true } // faster & only one yellow circle.

function newView(model, options = {}) {
    const view = new TwoView(model.world, Object.assign(viewOptions, options))
    const patchColors = getPatchColors(model, view)
    view.createPatchPixels(i => patchColors[i].pixel)
    return view
}
function getPatchColors(model) {
    const elevation = model.patches.exportDataSet('elevation')
    const grays = elevation.scale(0, 255).data
    const colors = grays.map(d => grayColorMap[Math.round(d)])
    model.localMins.forEach(p => (colors[p.id] = localMinColor))
    return colors
}

function drawView(model, view) {
    view.clear()

    view.drawPatches() // redraw cached patches colors
    // Note this uses constant values, thus are an object, not function.
    view.drawTurtles(model.turtles, {
        shape: shape,
        color: shapeColor,
        size: shapeSize,
    })
}

export default { newView, drawView }
