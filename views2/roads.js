import * as util from 'https://code.agentscript.org/src/utils.js'
import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import Animator from 'https://code.agentscript.org/src/Animator.js'

import Model from 'https://code.agentscript.org/models/RoadsModel.js'

export default async function runModel(div, steps = 500, fps = 30) {
    const model = new Model() // use model's default world options
    await model.startup()
    model.setup()

    // ==============================

    const baseUrl = 'https://code.agentscript.org/models/data/roads14.png'
    const baseMapTile = await util.imagePromise(baseUrl)
    const breedColor = {
        nodes: 'red',
        intersections: 'blue',
        drivers: 'green',
    }
    const breedSize = { nodes: 1, intersections: 2, drivers: 5 }
    const breedShape = {
        nodes: 'circle',
        intersections: 'circle',
        drivers: 'dart',
    }
    const drawOptions = {
        patchesColor: baseMapTile,
        turtlesColor: t => breedColor[t.breed.name],
        turtlesSize: t => breedSize[t.breed.name],
        turtlesShape: t => breedShape[t.breed.name],
        linksColor: 'black',
    }

    const view = new TwoDraw(model, { div, patchSize  4 }, drawOptions)

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
