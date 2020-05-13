import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'

const patchesColors = ColorMap.DarkGray
const turtleColors = ColorMap.Basic16
const linkColor = 'rgba(255, 255, 255, 0.50'
const shape = 'dart'
const shapeSize = 2

const viewOptions = { div: 'modelDiv' } // default is document.body

function newView(model, options = {}) {
    const view = new ThreeView(model.world, Object.assign(viewOptions, options))
    // One-time initialization: Draw static patches only once.
    view.drawPatches(model.patches, p => patchesColors.randomColor().pixel)
    return view
}

function drawView(model, view) {
    // view.drawPatches() // redraw cached patches colors

    view.drawLinks(model.links, { color: linkColor, width: 1 })
    view.drawTurtles(model.turtles, t => ({
        shape: shape,
        color: turtleColors.atIndex(t.id).css,
        size: shapeSize,
    }))

    view.render()
}

export default { newView, drawView }
