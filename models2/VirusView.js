import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const patchesColors = ColorMap.DarkGray
const turtleColors = {
    infected: 'red',
    susceptible: 'blue',
    resistant: 'gray',
}
const linkColor = 'rgba(255, 255, 255, 0.50'
const shape = 'circle'
const shapeSize = 1.5

const viewOptions = { patchSize: 10 }

function newView(model, options = {}) {
    return new TwoView(model.world, Object.assign(viewOptions, options))
}

function drawView(model, view) {
    view.clear('black')

    view.drawLinks(model.links, { color: linkColor, width: 1 })
    view.drawTurtles(model.turtles, t => ({
        shape: shape,
        color: turtleColors[t.state],
        size: shapeSize,
    }))
}

export default { newView, drawView }
