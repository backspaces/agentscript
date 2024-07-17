import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Model from 'https://code.agentscript.org/models/GridPathModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const drawOptions = {
        turtlesShape: 'circle',
        turtlesColor: 'red',
        turtlesSize: 0.5,
        linksColor: 'red',
        patchesMap: 'LightGray',
        textProperty: 'choices',
        textColor: 'white',
        textSize: 0.3,
    }

    const view = new TwoDraw(model, { div, patchSize: 50 }, drawOptions)

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
