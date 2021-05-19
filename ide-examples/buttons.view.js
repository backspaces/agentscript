import TwoDraw from '../src/TwoDraw.js'

const View = TwoDraw

const viewOpts = {
    patchSize: 20,
    drawOptions: {
        turtlesColor: t => (t.model.cluster.has(t) ? 'red' : 'random'),
        turtlesShape: 'circle',
        turtlesSize: 2,
        linksColor: 'rgba(255, 255, 255, 0.50',
    }
}

const worldOpts = {
    minX: -16,
    maxX: 16,
    minY: -16,
    maxY: 16
}

export { View, viewOpts, worldOpts }
