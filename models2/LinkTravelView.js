import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const Bright16 = ColorMap.Bright16
const driverShape = 'dart'
const nodeShape = 'circle'
const driverSize = 1.25
const nodeSize = 0.5
const linkWidth = 1

const viewOptions = { patchSize: 20 }

function newView(model, options = {}) {
    return new TwoView(model.world, Object.assign(viewOptions, options))
}

function drawView(model, view) {
    view.clear('black') // solid black background for visibility

    view.drawLinks(model.links, t => ({
        color: Bright16.atIndex(t.id).css,
        width: linkWidth,
    }))
    // Draw nodes first to not obscure drivers
    view.drawTurtles(model.nodes, t => ({
        shape: nodeShape,
        color: Bright16.atIndex(t.id).css,
        size: nodeSize,
    }))
    view.drawTurtles(model.drivers, t => ({
        shape: driverShape,
        color: Bright16.atIndex(t.id).css,
        size: driverSize,
    }))
}

export default { newView, drawView }
