import util from './util.js'
import ColorMap from '../src/ColorMap.js'

const defaults = {
    patchColor: undefined, // if color, use as clear(color)
    turtleColor: undefined, // if undefined, use random color
    linkColor: 'rgba(255,255,255,0.25',
    shape: 'dart',
    shapeSize: 1,
}
const defaultGrayMap = ColorMap.DarkGray
const defaultColorMap = ColorMap.Basic16

// A paramitized NL 2D default draw
function twoDraw(model, view, params = {}) {
    // {} target: don't overwrite defaults!!
    params = Object.assign({}, defaults, params)
    const {
        patchColor,
        turtleColor,
        linkColor,
        linkWidth,
        shape,
        shapeSize,
    } = params

    // Just draw patches once, results cached in view.patchesView
    if (view.ticks === 0 && !patchColor) {
        view.createPatchPixels(i => defaultGrayMap.randomColor().pixel)
    }

    if (typeof patchColor === 'undefined') {
        view.drawPatches() // redraw cached patches colors
    } else if (typeof patchColor === 'function') {
        view.drawPatches(model.patches, p => patchColor(p))
    } else if (util.isImageable(patchColor)) {
        view.drawPatchesImage(patchColor)
    } else {
        view.clear(patchColor)
    }

    view.drawLinks(model.links, { color: linkColor, width: linkWidth })

    view.drawTurtles(model.turtles, t => ({
        shape: shape,
        color:
            typeof turtleColor === 'undefined'
                ? defaultColorMap.atIndex(t.id).css
                : typeof turtleColor === 'function'
                ? turtleColor(t)
                : turtleColor,
        size: shapeSize,
    }))
}
