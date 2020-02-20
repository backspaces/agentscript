import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const shape = 'circle'
const shapeSize = 1
const Basic16 = ColorMap.Basic16
const LightGray = ColorMap.LightGray
const exitColors = {} // filled in by newView()

const viewOptions = { useSprites: true, patchSize: 8 }

function newView(model, options = {}) {
    const view = new TwoView(model.world, Object.assign(viewOptions, options))

    model.exits.ask((p, i) => (exitColors[p.id] = Basic16.atIndex(i + 4)))
    view.createPatchPixels(i => LightGray.randomColor().pixel)

    model.patches.ask(p => {
        switch (p.breed.name) {
            case 'exits':
                view.setPatchPixel(p.id, exitColors[p.id].pixel)
                break
            case 'inside':
                view.setPatchPixel(p.id, Color.typedColor('black').pixel)
                break
            case 'wall':
                view.setPatchPixel(p.id, Color.typedColor('gray').pixel)
                break
        }
    })

    return view
}
function drawView(model, view) {
    view.drawPatches() // redraw cached patches colors

    view.drawTurtles(model.turtles, t => ({
        shape: shape,
        color: exitColors[t.exit.id].css,
        size: shapeSize,
    }))
}

export default { newView, drawView }
