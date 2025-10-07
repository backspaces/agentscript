import TwoDraw from '/src/TwoDraw.js'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 15,
        drawOptions: {
            turtlesColor: 'green',
            turtlesSize: 3,
            turtlesShape: 'bug',
            linksColor: 'red',
            linksWidth: 3,
            // patchesMap: 'Jet', // for bright patch colors!
        },
    })
}
