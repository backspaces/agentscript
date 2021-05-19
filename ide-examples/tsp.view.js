import TwoDraw from '../src/TwoDraw.js'

const View = TwoDraw

const viewOpts = {
    patchSize: 6,
    drawOptions: {
        patchesColor: 'black',
        turtlesShape: 'circle',
        // turtlesSize of 0 will skip drawing this turle
        // here "travelers" are skipped
        turtlesSize: t => (t.breed.name === 'nodes' ? 1.25 : 0),
        turtlesColor: 'yellow',
        linksColor: 'red',
    }
}

const worldOpts = {
    minX: -50,
    maxX: 50,
    minY: -50,
    maxY: 50
}

export { View, viewOpts, worldOpts }
