import * as util from '../src/utils.js'
import TwoDraw from '../src/TwoDraw.js'
import World from '../src/World.js'
import Shapes from '../src/Shapes.js'
import Animator from '../src/Animator.js'

const shapes = new Shapes()

async function addImages() {
    await shapes.imagePathPromise(
        'twitter',
        '../models/data/twitter.png'
    )
    await shapes.imagePathPromise(
        'redfish',
        '../models/data/redfish.png'
    )
}

function turtleName(t) {
    return shapes.nameAtIndex(t.id)
}

const initApp = async (Model, divEl) => {
    await addImages()

    const model = new Model(World.defaultOptions(25, 16))
    model.population = 100
    await model.startup()
    model.setup()

    const view = new TwoDraw(
        model,
        {
            div: 'modelDiv',
            patchSize: 20,
            drawOptions: {
                turtlesShape: t => turtleName(t),
                turtlesSize: t => (turtleName(t) === 'redfish' ? 5 : 3),
            }
        },
    )

    const anim = new Animator(() => {
        model.step()
        view.draw()
    })
}

export { initApp }
