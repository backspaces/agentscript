import Color from '../src/Color.js'
import ThreeDraw from '../src/ThreeDraw.js'

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

export default function newView(model, viewOptions = {}) {
    const drawOptions = {
        patchesColor: p => typeColors[p.type],
    }

    return new ThreeDraw(model, viewOptions, drawOptions)
}
