import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Color from 'https://code.agentscript.org/src/Color.js'
import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'
import Model from 'https://code.agentscript.org/models/AntsModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const nestColor = Color.typedColor('yellow')
    const foodColor = Color.typedColor('blue')
    const nestColorMap = ColorMap.gradientColorMap(20, ['black', nestColor])
    const foodColorMap = ColorMap.gradientColorMap(20, ['black', foodColor])

    const drawOptions = {
        patchesColor: p => {
            if (p.isNest) return nestColor
            if (p.isFood) return foodColor
            return p.foodPheromone > p.nestPheromone
                ? foodColorMap.scaleColor(p.foodPheromone, 0, 1)
                : nestColorMap.scaleColor(p.nestPheromone, 0, 1)
        },
        turtlesShape: 'bug',
        turtlesSize: 3,
        turtlesColor: t => (t.carryingFood ? nestColor : foodColor),
    }

    const view = new TwoDraw(model, {
        div,
        useSprites: true, // ant shape difficult to draw
        patchSize: 10,
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
