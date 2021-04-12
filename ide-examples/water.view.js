import * as util from '../src/utils.js'
import ColorMap from '../src/ColorMap.js'
import TwoDraw from '../src/TwoDraw.js'
import Animator from '../src/Animator.js'

const patchColors = ColorMap.gradientColorMap(256, ['navy', 'aqua'])
const maxZ = 10

const initApp = async (Model, divEl) => {
    const model = new Model()
    await model.startup()
    model.setup()

    const viewOpts = {
        div: divEl,
        drawOptions: {
            // Patches only model:
            patchesColor: p => patchColors.scaleColor(p.zpos, -maxZ, maxZ),
        }
    }
    
    const view = new TwoDraw(model, viewOpts)
    view.setPatchesSmoothing(true) // make water smoother
    
    const anim = new Animator(() => {
        model.step()
        view.draw()
    })

    util.toWindow({ util, model, view })
}

export { initApp }
