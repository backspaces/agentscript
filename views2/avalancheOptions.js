import Color from 'https://code.agentscript.org/src/Color.js'
import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

export default function TwoDrawOptions(div, model, patchSize = 10) {
    const pi = Math.PI

    const snowColor = ColorMap.gradientColorMap(20, ['rgb(98,52,18)', 'white'])
    const drawOptions = {
        patchesColor: p => {
            const aspect2 = (p.aspect + 2 * pi) % (2 * pi)
            const k = (pi - Math.abs(aspect2 - pi)) / pi
            const snow = snowColor.scaleColor(p.snowDepth, 0, 6)
            const col = Color.typedColor(k * snow[0], k * snow[1], k * snow[2])
            return col
        },
    }

    return { div, patchSize, drawOptions }
}
