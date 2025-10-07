import TwoDraw from '/src/TwoDraw.js'
// import Color from '/src/Color.js'
import ColorMap from '/src/ColorMap.js'

export default function (model, div = 'modelDiv') {
    const patchColors = model.patches.map(p => {
        switch (p.breed.name) {
            case 'exits':
                return ColorMap.Basic16.atIndex(p.exitNumber + 4)
            case 'inside':
                return 'black'
            case 'wall':
                return 'gray'
            default:
                return ColorMap.LightGray.randomColor()
        }
    })
    return new TwoDraw(model, {
        div,
        patchSize: 8,
        drawOptions: {
            turtlesShape: 'circle',
            turtlesColor: t => patchColors[t.exit.id],
            turtlesSize: 1,
            initPatches: () => patchColors,
        },
    })
}
