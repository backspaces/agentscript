import View from '../src/TwoDraw.js'

const turtleColors = {
    infected: 'red',
    susceptible: 'blue',
    resistant: 'gray',
}

const viewOpts = {
    patchSize: 10,
    drawOptions: {
        patchesColor: 'black',
        turtlesShape: 'circle',
        turtlesSize: 1.5,
        turtlesColor: t => turtleColors[t.state],
        linksColor: 'rgba(255, 255, 255, 0.50',
    }
}

const worldOpts = {
    minX: -50,
    maxX: 50,
    minY: -50,
    maxY: 50
}

export { View, viewOpts, worldOpts }
