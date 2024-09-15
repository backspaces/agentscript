import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

export default function TwoDrawOptions(div, model, patchSize = 20) {
    const colorMap = ColorMap.gradientColorMap(8, ['black', 'purple', 'yellow'])

    const drawOptions = {
        turtlesSize: 2,
        patchesColor: p => colorMap.scaleColor(p.pheromone, 0, 100),
    }

    return { div, patchSize, drawOptions }
}
