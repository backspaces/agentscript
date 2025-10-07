import TwoDraw from '/src/TwoDraw.js'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 6,
        drawOptions: {
            patchesColor: 'black',
            turtlesShape: 'circle',
            // turtlesSize of 0 will skip drawing this turle
            // here "travelers" are skipped
            turtlesSize: t => (t.breed.name === 'nodes' ? 2 : 0),
            turtlesColor: 'yellow',
            linksColor: 'red',
            linksWidth: 2,
        },
    })
}
