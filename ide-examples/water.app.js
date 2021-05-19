import * as util from '../src/utils.js'
import ColorMap from '../src/ColorMap.js'
import TwoDraw from '../src/TwoDraw.js'
import Animator from '../src/Animator.js'

const patchColors = ColorMap.gradientColorMap(256, ['navy', 'aqua'])
const maxZ = 10

const initApp = async (Model, divEl) => {
    const model = new Model({
      minX: 0,
      maxX: 60,
      minY: 0,
      maxY: 60
    })
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
    
    const animator = new Animator(() => {
        model.step()
        view.draw()
    })

    return { model, view, animator }
}

export { initApp }
