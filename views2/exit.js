import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Color from 'https://code.agentscript.org/src/Color.js'
import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

import Model from 'https://code.agentscript.org/models/ExitModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const patchColors = model.patches.map(p => {
        switch (p.breed.name) {
            case 'exits':
                return ColorMap.Basic16.atIndex(p.exitNumber + 4)
            case 'inside':
                return Color.typedColor('black')
            case 'wall':
                return Color.typedColor('gray')
            default:
                return ColorMap.LightGray.randomColor()
        }
    })
    const drawOptions = {
        turtlesShape: 'circle',
        turtlesColor: t => patchColors[t.exit.id],
        turtlesSize: 1,
        initPatches: (model, view) => patchColors,
    }

    const view = new TwoDraw(model, { div, patchSize: 8 }, drawOptions)

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
