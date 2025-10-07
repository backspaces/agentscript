import TwoDraw from '/src/TwoDraw.js'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 20,
        drawOptions: {
            turtlesColor: t => (model.cluster.has(t) ? 'red' : 'random'),
            turtlesShape: 'circle',
            turtlesSize: 2,
            linksColor: 'yellow',
            linksWidth: 3,
        },
    })
}
