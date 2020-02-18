import Color from '../src/Color.js'
import TwoView from '../src/TwoView.js'

const wallsColor = Color.typedColor(222, 184, 135).pixel
const backgroundColor = Color.typedColor('black').pixel
const leftyColor = 'green'
const rightyColor = 'red'
const shape = 'dart'
const shapeSize = 2

const viewOptions = {} // defaults ok

function newView(model, options = {}) {
    const view = new TwoView(model.world, Object.assign(viewOptions, options))
    // one-time initialization: Create static patch colors
    view.setPatchesPixels(model.patches, p =>
        p.breed.name === 'walls' ? wallsColor : backgroundColor
    )
    return view
}

function drawView(model, view) {
    // view.clear('black')
    view.drawPatches() // redraw cached patches colors

    view.drawTurtles(model.turtles, t => ({
        shape: shape,
        color: t.breed.name === 'lefty' ? leftyColor : rightyColor,
        size: shapeSize,
    }))
}

export default { newView, drawView }
