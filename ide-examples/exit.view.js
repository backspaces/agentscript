import View from '../src/TwoDraw.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'

let cachedColors
const patchColors = model => {
    if (cachedColors) {
        return cachedColors
    }
    
    cachedColors = model.patches.map(p => {
        switch (p.breed.name) {
            case 'exits':
                return ColorMap.Basic16.atIndex(p.exitNumber + 4)
            case 'inside':
                return Color.typedColor('black')
            case 'wall':
                return Color.typedColor('gray')
            default:
                return ColorMap.LightGray.randomColor()
        }
    })
    return cachedColors
}

const viewOpts = {
    patchSize: 8,
    drawOptions: {
        // turtlesShape: 'circle',
        turtlesColor: t => patchColors(t.model)[t.exit.id],
        turtlesSize: 1,
        initPatches: (model, view) => patchColors(model),
    }
}

const worldOpts = {
    minX: -35,
    maxX: 35,
    minY: -35,
    maxY: 35
}

export { View, viewOpts, worldOpts }
