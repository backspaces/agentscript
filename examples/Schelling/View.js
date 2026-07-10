import TwoDraw from 'https://agentscript.org/src/TwoDraw.js'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 10,
        drawOptions: {
            patchesColor: 'white',
            turtlesColor: t => (t.breed.name === 'Os' ? 'red' : 'blue'),
            turtlesShape: 'square',
            turtlesRotate: false,
        },
    })
}
