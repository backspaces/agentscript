import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Model from 'https://code.agentscript.org/models/VirusModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const turtleColors = {
        infected: 'red',
        susceptible: 'blue',
        resistant: 'gray',
    }
    const drawOptions = {
        patchesColor: 'black',
        turtlesShape: 'circle',
        turtlesSize: 1.5,
        turtlesColor: t => turtleColors[t.state],
        linksColor: 'rgba(255, 255, 255, 0.50',
    }

    const view = new TwoDraw(model, { div, patchSize: 10 }, drawOptions)

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
