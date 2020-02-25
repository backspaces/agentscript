import World from '../src/World.js'
import util from '../src/util.js'
import Color from '../src/Color.js'
import ThreeView from '../src/ThreeView.js'
import FireModel from '../models/FireModel.js'

const patchPixels = {
    dirt: Color.cssToPixel('yellow'),
    tree: Color.cssToPixel('green'),
    fire: Color.cssToPixel('red'),
    ember4: Color.rgbaToPixel(255 - 25, 0, 0),
    ember3: Color.rgbaToPixel(255 - 50, 0, 0),
    ember2: Color.rgbaToPixel(255 - 75, 0, 0),
    ember1: Color.rgbaToPixel(255 - 100, 0, 0),
    ember0: Color.rgbaToPixel(255 - 125, 0, 0),
}
const timeoutMS = 0
const steps = 500
const density = 60

const world = World.defaultOptions(125)
const model = new FireModel(world)
model.density = density
model.setup()
const view = new ThreeView(world)
util.toWindow({ model, view, patchPixels, Color, util })

const perf = util.fps() // Just for testing, not needed for production.
util.timeoutLoop(
    () => {
        model.step()
        model.tick()

        view.drawPatches(model.patches, p => patchPixels[p.type])
        view.render()
        perf()
    },
    steps,
    timeoutMS
).then(() => {
    console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
    view.idle()
})
