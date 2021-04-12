import View from '../src/TwoDraw.js'
import ColorMap from '../src/ColorMap.js'

const viewOpts = {
    patchSize: 3,
    drawOptions: {
        patchesColor: p => ColorMap.Rgb256.scaleColor(p.ran, 0, 1),
        turtlesColor: 'red',
        turtlesSize: 8,
    }
}

const worldOpts = {
    minX: -200,
    maxX: 200,
    minY: -100,
    maxY: 100
}

export { View, viewOpts, worldOpts }
