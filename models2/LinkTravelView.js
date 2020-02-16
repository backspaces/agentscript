import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const Basic16 = ColorMap.Bright16
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
        color: Basic16.atIndex(t.id).css,
        width: linkWidth,
    }))
    view.drawTurtles(model.drivers, t => ({
        shape: driverShape,
        color: Basic16.atIndex(t.id).css,
        size: driverSize,
    }))
    view.drawTurtles(model.nodes, t => ({
        shape: nodeShape,
        color: Basic16.atIndex(t.id).css,
        size: nodeSize,
    }))
}

export default { newView, drawView }
