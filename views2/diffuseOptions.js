import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

export default function TwoDrawOptions(div, model, patchSize = 3) {
    const drawOptions = {
        patchesColor: p => ColorMap.Rgb256.scaleColor(p.ran, 0, 1),
        turtlesColor: 'red',
        turtlesSize: 8,
    }

    return { div, patchSize, drawOptions }
}
