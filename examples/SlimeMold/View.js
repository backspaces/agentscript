import TwoDraw from 'https://agentscript.org/src/TwoDraw.js'
import ColorMap from 'https://agentscript.org/src/ColorMap.js'

const colorMap = ColorMap.gradientColorMap(8, ['black', 'purple', 'yellow'])

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 15,
        drawOptions: {
            turtlesSize: 2,
            patchesColor: p => colorMap.scaleColor(p.pheromone, 0, 100),
        },
    })
}
