import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Color from 'https://code.agentscript.org/src/Color.js'
import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

import Model from 'https://code.agentscript.org/models/AvalancheModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

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

    const view = new TwoDraw(
        model,
        {
            div,
        },
        drawOptions
    )

    // ==============================

    const anim = new Animator(
        () => {
            model.step()
            view.draw()
        },
        steps, // how many steps
        fps // at fps steps/second
    )

    return { model, view, anim }
}
