import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

export default function TwoDrawOptions(div, model = null) {
    const drawOptions = {
        patchesColor: p => ColorMap.Rgb256.scaleColor(p.ran, 0, 1),
        turtlesColor: 'red',
        turtlesSize: 8,
    }

    const twoDrawOptions = { div, patchSize: 3, drawOptions }
    return twoDrawOptions
}
