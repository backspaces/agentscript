import TwoDraw from 'https://agentscript.org/src/TwoDraw.js'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 5,
        drawOptions: {
            // patches-only model, no turtles.
            patchesColor: p => (p.living ? 'red' : 'black'),
        },
    })
}
