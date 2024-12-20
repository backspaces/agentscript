import Color from 'https://code.agentscript.org/src/Color.js'
import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

export default function TwoDrawOptions(div, model, patchSize = 8) {
    const patchColors = model.patches.map(p => {
        switch (p.breed.name) {
            case 'exits':
                return ColorMap.Basic16.atIndex(p.exitNumber + 4)
            case 'inside':
                return Color.typedColor('black')
            case 'wall':
                return Color.typedColor('gray')
            default:
                return ColorMap.LightGray.randomColor()
        }
    })
    const drawOptions = {
        turtlesShape: 'circle',
        turtlesColor: t => patchColors[t.exit.id],
        turtlesSize: 1,
        initPatches: (model, view) => patchColors,
    }

    return { div, patchSize, drawOptions }
}
