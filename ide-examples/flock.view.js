import TwoDraw from '../src/TwoDraw.js'

const View = TwoDraw

const viewOpts = {
    patchSize: 30,
    useSprites: true,
    drawOptions: {
      turtlesSize: 1
    }
}

const worldOpts = {
    minX: -10,
    maxX: 10,
    minY: -10,
    maxY: 10
}

export { View, viewOpts, worldOpts }