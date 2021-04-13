import View from '../src/TwoDraw.js'

const isNode = t => t.breed.name === 'nodes'

const viewOpts = {
    patchSize: 20,
    drawOptions: {
        patchesColor: 'black',
        turtlesColor: t => (isNode(t) ? 'red' : 'random'),
        turtlesShape: t => (isNode(t) ? 'circle' : 'dart'),
        turtlesSize: t => (isNode(t) ? 0.5 : 1.25),
    }
}

const worldOpts = {
    minX: -16,
    maxX: 16,
    minY: -16,
    maxY: 16
}

export { View, viewOpts, worldOpts }
