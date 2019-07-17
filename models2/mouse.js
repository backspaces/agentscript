import util from '../src/util.js'
import Mouse from '../src/Mouse.js'
import ColorMap from '../src/ColorMap.js'
import Model from '../src/Model.js'
import TwoView from '../src/TwoView.js'
// import World from '../src/World.js'
util.toWindow({ util, Mouse, ColorMap, Model, TwoView })

const model = new Model() // use default world
const world = model.world
const view = new TwoView('modelDiv', world, { patchSize: 20 })

const colors = ColorMap.Rgb256
view.createPatchPixels(() => colors.randomColor().pixel)
view.drawPatches()

const callback = e => {
    const { xCor, yCor } = mouse
    const index = world.patchXYtoPatchIndex(xCor, yCor)
    console.log(xCor, yCor, index)
    const color = mouse.down ? colors[0] : colors.randomColor()
    view.setPatchPixel(index, color.pixel)
    view.drawPatches()
}
const mouse = new Mouse(view.canvas, world, callback)
util.toWindow({ model, view, world, mouse, colors })

mouse.start()
