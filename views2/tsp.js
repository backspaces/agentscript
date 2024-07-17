import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Model from 'https://code.agentscript.org/models/TspModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const drawOptions = {
        patchesColor: 'black',
        turtlesShape: 'circle',
        // turtlesSize of 0 will skip drawing this turle
        // here "travelers" are skipped
        turtlesSize: t => (t.breed.name === 'nodes' ? 1.25 : 0),
        turtlesColor: 'yellow',
        linksColor: 'red',
    }

    const view = new TwoDraw(model, { div, patchSize: 6 }, drawOptions)

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
