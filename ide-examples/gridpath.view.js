import TwoDraw from '../src/TwoDraw.js'

const View = TwoDraw

const viewOpts = {
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
    }
}

const worldOpts = {
    minX: 0,
    maxX: 9,
    minY: 0,
    maxY: 9
}

export { View, viewOpts, worldOpts }