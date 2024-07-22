import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import World from 'https://code.agentscript.org/src/World.js'
import Shapes from 'https://code.agentscript.org/src/Shapes.js'

import Model from 'https://code.agentscript.org/models/HelloModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model(World.defaultOptions(25, 16)) // override Model's size
    model.population = 100
    await model.startup()
    model.setup()

    // ==============================

    const shapes = new Shapes()

    await shapes.imagePathPromise(
        'twitter',
        'https://code.agentscript.org/models/data/twitter.png'
    )
    await shapes.imagePathPromise(
        'redfish',
        'https://code.agentscript.org/models/data/redfish.png'
    )
    shapes.createEmojiPath('lion', 0x1f981)
    shapes.createEmojiPath('smiley', 0x1f600)
    shapes.createEmojiPath('tree', 0x1f332)

    ////

    function turtleName(t) {
        return shapes.nameAtIndex(t.id)
    }
    const drawOptions = {
        turtlesShape: t => turtleName(t),
        turtlesSize: t => (turtleName(t) === 'redfish' ? 5 : 3),
        turtlesRotate: t => !['lion', 'smiley', 'tree'].includes(turtleName(t)),
    }

    const view = new TwoDraw(model, { div, patchSize: 20 }, drawOptions)

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
