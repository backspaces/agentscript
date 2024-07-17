import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Color from 'https://code.agentscript.org/src/Color.js'

import Model from 'https://code.agentscript.org/models/FireModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const typeColors = {
        dirt: Color.cssToPixel('yellow'),
        tree: Color.cssToPixel('green'),
        fire: Color.cssToPixel('red'),
        ember4: Color.rgbaToPixel(255 - 25, 0, 0),
        ember3: Color.rgbaToPixel(255 - 50, 0, 0),
        ember2: Color.rgbaToPixel(255 - 75, 0, 0),
        ember1: Color.rgbaToPixel(255 - 100, 0, 0),
        ember0: Color.rgbaToPixel(255 - 125, 0, 0),
    }
    const drawOptions = {
        patchesColor: p => typeColors[p.type],
    }

    const view = new TwoDraw(model, { div, patchSize: 4 }, drawOptions)

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
