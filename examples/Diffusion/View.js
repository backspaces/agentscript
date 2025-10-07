import TwoDraw from '/src/TwoDraw.js'
import ColorMap from '/src/ColorMap.js'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 3,
        drawOptions: {
            patchesColor: p => ColorMap.Rgb256.scaleColor(p.ran, 0, 1),
            turtlesColor: 'red',
            turtlesSize: 8,
        },
    })
}
