import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const nodeShape = 'circle'
const nodeSize = 1.25
const nodeColor = 'yellow'
const linkColor = 'red'
const linkWidth = 1

const viewOptions = { patchSize: 5 }

function newView(model, options = {}) {
    return new TwoView(model.world, Object.assign(viewOptions, options))
}

function drawView(model, view) {
    view.clear('black') // solid black background for visibility

    // Note these both use constant values, thus are an object, not function.
    view.drawLinks(model.links, {
        color: linkColor,
        width: linkWidth,
    })
    // turtleBreeds('nodes travelers')
    // Draw just the nodes, the rest are invisible Genetic Algorithm "travelers"
    view.drawTurtles(model.nodes, {
        shape: nodeShape,
        color: nodeColor,
        size: nodeSize,
    })
}

export default { newView, drawView }
