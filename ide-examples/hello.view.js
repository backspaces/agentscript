import TwoDraw from '../src/TwoDraw.js'

const View = TwoDraw

const viewOpts = {
    patchSize: 20,
}

const worldOpts = {
    minX: -16,
    maxX: 16,
    minY: -16,
    maxY: 16
}

export { View, viewOpts, worldOpts }
