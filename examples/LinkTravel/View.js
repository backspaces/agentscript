import TwoDraw from '/src/TwoDraw.js'

const isNode = t => t.breed.name === 'nodes'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 17,
        drawOptions: {
            patchesColor: 'black',
            turtlesColor: t => (isNode(t) ? 'red' : 'random'),
            turtlesShape: t => (isNode(t) ? 'circle' : 'dart'),
            turtlesSize: t => (isNode(t) ? 0.5 : 1.25),
            linksWidth: 2,
        },
    })
}
