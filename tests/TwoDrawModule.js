import util from '../src/util.js'
import TwoView from '../src/TwoView.js'
import ColorMap from '../src/ColorMap.js'

const defaults = {
    patchColor: undefined,
    turtleColor: undefined,
    linkColor: 'rgba(255,255,255,0.25',
    linkWidth: 1,
    shape: 'dart',
    shapeSize: 1,
}
const defaultGrayMap = ColorMap.DarkGray
const defaultColorMap = ColorMap.Basic16

let view

// Options can override any of these TwoView defaults:
// {
//     div: document.body,
//     useSprites: false,
//     patchSize: 10,
// }
function init(model, options = {}) {
    view = new TwoView(model.world, options)
    view.createPatchPixels(i => defaultGrayMap.randomColor().pixel)
    return view
}

function reset(patchSize, useSprites = view.useSprites) {
    view.reset(patchSize, useSprites)
}

// A paramitized NL 2D default draw
function draw(model, params = {}) {
    if (!view) init(model)
    params = Object.assign({}, defaults, params)
    const {
        patchColor,
        turtleColor,
        linkColor,
        linkWidth,
        shape,
        shapeSize,
    } = params

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

export default { init, reset, draw }
