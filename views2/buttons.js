import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Model from 'https://code.agentscript.org/models/ButtonsModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const drawOptions = {
        turtlesColor: t => (model.cluster.has(t) ? 'red' : 'random'),
        turtlesShape: 'circle',
        turtlesSize: 2,
        linksColor: 'rgba(255, 255, 255, 0.50',
    }

    const view = new TwoDraw(model, {
        div,
        // useSprites: true, // some shapes difficult to draw
        patchSize: 20,
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
