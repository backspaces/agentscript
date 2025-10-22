import TwoDraw from 'https://agentscript.org/src/TwoDraw.js'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 50,
        drawOptions: {
            turtlesShape: 'circle',
            turtlesColor: 'red',
            turtlesSize: 0.5,
            linksColor: 'red',
            patchesMap: 'LightGray',
            textProperty: 'choices',
            textColor: 'white',
            textSize: 0.3,
        },
    })
}
