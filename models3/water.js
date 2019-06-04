import World from '../src/World.js'
import util from '../src/util.js'
import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'
import WaterModel from '../models/WaterModel.js'

const timeoutMS = 0
const cmap = ColorMap.gradientColorMap(256, ['navy', 'aqua'])
const maxZ = 10
const useSmoothing = true // unusual to have non-crisp patches

const world = World.defaultWorld(50)
const model = new WaterModel(world)
model.setup()

const view = new ThreeView(document.body, world)
view.setPatchesSmoothing(useSmoothing)
util.toWindow({ model, view, cmap, ColorMap, util })

const perf = util.fps()
util.timeoutLoop(
    () => {
        model.step()
        model.tick()

        view.drawPatches(
            model.patches,
            p => cmap.scaleColor(p.zpos, -maxZ, maxZ).pixel
        )
        view.draw()
        perf()
    },
    500,
    timeoutMS
).then(() => {
    console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
    view.idle()
})
