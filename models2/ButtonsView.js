import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const patchesColors = ColorMap.DarkGray
const turtleColors = ColorMap.Basic16
const linksColor = 'rgba(255, 255, 255, 0.50'
const shape = 'circle'
const shapeSize = 2
const clusterColor = 'red'

const viewOptions = { patchSize: 20 }

function newView(model, options = {}) {
    const view = new TwoView(model.world, Object.assign(viewOptions, options))
    // one-time initialization: Create static patch colors
    view.createPatchPixels(i => patchesColors.randomColor().pixel)
    return view
}

function drawView(model, view) {
    view.drawPatches() // redraw cached patches colors

    view.drawLinks(model.links, { color: linksColor, width: 1 })

    // Draw all the turtles a constant color (from t.id)
    const set = model.cluster
    view.drawTurtles(model.turtles, t => ({
        shape: shape,
        color: set.has(t) ? clusterColor : turtleColors.atIndex(t.id).css,
        size: shapeSize,
    }))
    // Now recolor the current cluster
    // view.drawTurtles(Array.from(model.cluster), t => ({
    //     shape: shape,
    //     color: clusterColor,
    //     size: shapeSize,
    // }))
}

export default { newView, drawView }
