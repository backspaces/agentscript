import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

import Model from 'https://code.agentscript.org/models/SlimeMoldModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const colorMap = ColorMap.gradientColorMap(8, ['black', 'purple', 'yellow'])

    const drawOptions = {
        turtlesSize: 2,
        patchesColor: p => colorMap.scaleColor(p.pheromone, 0, 100),
    }

    const view = new TwoDraw(model, {
        div,
        patchSize: 15,
        drawOptions,
    })

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
