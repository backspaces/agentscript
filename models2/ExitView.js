import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const shape = 'circle'
const shapeSize = 1

const viewOptions = { useSprites: true, patchSize: 8 }

let patchColors
function newView(model, options = {}) {
    const view = new TwoView(model.world, Object.assign(viewOptions, options))

    patchColors = model.patches.map(p => {
        switch (p.breed.name) {
            case 'exits':
                // const exitNumber = model.exits.indexOf(p)
                return ColorMap.Basic16.atIndex(p.exitNumber + 4)
            case 'inside':
                return Color.typedColor('black')
            case 'wall':
                return Color.typedColor('gray')
            default:
                return ColorMap.LightGray.randomColor()
        }
    })
    view.createPatchPixels(i => patchColors[i].pixel)

    return view
}
function drawView(model, view) {
    view.drawPatches() // redraw cached patches colors

    view.drawTurtles(model.turtles, t => ({
        shape: shape,
        color: patchColors[t.exit.id].css,
        size: shapeSize,
    }))
}

export default { newView, drawView }
