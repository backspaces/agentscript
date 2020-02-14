import Color from '../src/Color.js'
import TwoView from '../src/TwoView.js'

const typeColors = {
    dirt: Color.cssToPixel('yellow'),
    tree: Color.cssToPixel('green'),
    fire: Color.cssToPixel('red'),
    ember4: Color.rgbaToPixel(255 - 25, 0, 0),
    ember3: Color.rgbaToPixel(255 - 50, 0, 0),
    ember2: Color.rgbaToPixel(255 - 75, 0, 0),
    ember1: Color.rgbaToPixel(255 - 100, 0, 0),
    ember0: Color.rgbaToPixel(255 - 125, 0, 0),
}

const viewOptions = { patchSize: 4 }

function newView(model, options = {}) {
    return new TwoView(model.world, Object.assign(viewOptions, options))
}

function drawView(model, view) {
    view.clear()
    view.drawPatches(model.patches, p => typeColors[p.type])
}

export default { newView, drawView }
