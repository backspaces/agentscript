import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Color from 'https://code.agentscript.org/src/Color.js'
import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

import Model from 'https://code.agentscript.org/models/DropletsModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const drawOptions = {
        turtlesShape: 'square',
        turtlesRotate: false,
        turtlesSize: 0.8,
        turtlesColor: 'yellow',
        initPatches: (model, view) => {
            const elevation = model.patches.exportDataSet('elevation')
            const grays = elevation.scale(0, 255).data
            const colors = grays.map(d => ColorMap.Gray[Math.round(d)])
            const localMinColor = Color.typedColor(255, 0, 0)
            model.localMins.forEach(p => {
                colors[p.id] = localMinColor
            })
            return colors
        },
    }

    const view = new TwoDraw(
        model,
        {
            div,
            useSprites: true, // lots of turtles, sprites faster
        },
        drawOptions
    )

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
