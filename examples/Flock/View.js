import TwoDraw from 'https://agentscript.org/src/TwoDraw.js'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 20,
        drawOptions: {
            turtlesSize: 1.5,
        },
    })
}
