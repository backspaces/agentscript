import TwoDraw from '../src/TwoDraw.js'

const View = TwoDraw

const viewOpts = {
    patchSize: 20,
    drawOptions: {
        turtlesSize: 2, // turtle size in patches
        textProperty: 'id',
        textSize: 0.8, // text size in patches
    }
}

const worldOpts = {
    minX: -16,
    maxX: 16,
    minY: -16,
    maxY: 16
}

export { View, viewOpts, worldOpts }
