import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

import Model from 'https://code.agentscript.org/models/WaterModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const patchColors = ColorMap.gradientColorMap(256, ['navy', 'aqua'])
    const maxZ = 10
    const drawOptions = {
        // Patches only model:
        patchesColor: p => patchColors.scaleColor(p.zpos, -maxZ, maxZ),
    }

    const view = new TwoDraw(model, { div }, drawOptions)

    view.setPatchesSmoothing(true) // make water smoother

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
