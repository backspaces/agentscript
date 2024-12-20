import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Color from 'https://code.agentscript.org/src/Color.js'

import Model from 'https://code.agentscript.org/models/WallFollowerModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const wallsColor = Color.typedColor(222, 184, 135)
    const backgroundColor = Color.typedColor('black')
    const drawOptions = {
        patchesColor: p =>
            p.breed.name === 'walls' ? wallsColor : backgroundColor,
        turtlesShape: 'dart',
        turtlesSize: 2,
        turtlesColor: t => (t.breed.name === 'lefty' ? 'green' : 'red'),
    }

    const view = new TwoDraw(model, { div }, drawOptions)

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
