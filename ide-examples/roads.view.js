import * as util from '../src/utils.js'
import TwoDraw from '../src/TwoDraw.js'
import Animator from '../src/Animator.js'

const initApp = async (Model, divEl) => {
    const model = new Model()
    await model.startup()
    model.setup()

    const { Z, X, Y } = model.zxy
    const baseUrl = `https://tile.openstreetmap.org/${Z}/${X}/${Y}.png`
    const baseMapTile = await util.imagePromise(baseUrl)
    const isIntersection = t => t.breed.name === 'intersections'

    const view = new TwoDraw(
        model,
        {
            div: divEl,
            patchSize: 4,
            drawOptions: {
                patchesColor: baseMapTile,
                turtlesShape: 'circle',
                turtlesColor: t => (isIntersection(t) ? 'blue' : 'red'),
                turtlesSize: t => (isIntersection(t) ? 2 : 1),
                linksColor: 'black',
            }
        }
    )

    const anim = new Animator(() => {
        model.step()
        view.draw()
    })

    util.toWindow({ util, model, view })
}

export { initApp }
