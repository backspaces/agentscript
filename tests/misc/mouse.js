import util from '../src/util.js'
import Mouse from '../src/Mouse.js'
import ColorMap from '../src/ColorMap.js'
import Model from '../src/Model.js'
import TwoView from '../src/TwoView.js'
// import World from '../src/World.js'
util.toWindow({ util, Mouse, ColorMap, Model, TwoView })

const model = new Model() // use default world
const world = model.world
const view = new TwoView(world, { div: 'modelDiv', patchSize: 20 })

const colors = ColorMap.Rgb256
view.createPatchPixels(() => colors.randomColor().pixel)
view.drawPatches()

const callback = mouse => {
    const { x, y } = mouse
    // console.log(x, y)
    const color = mouse.down ? colors[0] : colors.randomColor()
    // const ix = model.patches.patchIndex(x, y)
    const ix = world.xyToPatchIndex(x, y)
    view.setPatchPixel(ix, color.pixel)
    view.drawPatches()
}
const mouse = new Mouse(view.canvas, world, callback).start()
util.toWindow({ model, view, world, mouse, colors })

// mouse.start()
