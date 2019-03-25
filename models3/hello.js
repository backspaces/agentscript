import util from '../src/util.js'
import Color from '../src/Color.js'
import ThreeView from '../src/ThreeView.js'
import HelloModel from '../models/HelloModel.js'

const colors25 = util.repeat(25, (i, a) => {
    a[i] = Color.randomCssColor()
})
const linkColor = Color.typedColor(255, 255, 255)
const timeoutMS = 0

const model = new HelloModel() // default options
model.setup()
const view = new ThreeView()
util.toWindow({ model, view, Color, util })
// Just draw patches once:
view.drawPatches(model.patches, p => Color.randomGrayPixel(0, 100))

const perf = util.fps()
util.timeoutLoop(
    () => {
        model.step()
        model.tick()

        view.drawTurtles(model.turtles, (t, i) => ({
            sprite: view.spriteSheet.newSprite('dart', colors25[i % 25]),
            size: 2,
        }))
        view.drawLinks(model.links, { color: linkColor.webgl })
        view.draw()
        perf()
    },
    500,
    timeoutMS
).then(() => {
    console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
    view.idle()
})
