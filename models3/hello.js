import util from '../src/util.js'
import Color from '../src/Color.js'
import ThreeView from '../src/ThreeView.js'
import HelloModel from '../models/HelloModel.js'

const params = {
    seed: null,
    population: 100,
    maxX: 30,
    maxY: null,
    steps: 500,
    world: null,
}
Object.assign(params, util.parseQueryString())
if (params.seed != null) util.randomSeed(params.seed)
if (params.maxY == null) params.maxY = params.maxX
params.world = HelloModel.defaultWorld(params.maxX, params.maxY)

const colors25 = util.repeat(25, (i, a) => {
    a[i] = Color.randomCssColor()
})
const linkColor = Color.typedColor(255, 255, 255)

const model = new HelloModel(params.world)
model.population = params.population
model.setup()

const view = new ThreeView(document.body, params.world)
// Just draw patches once:
view.createPatchPixels(i => Color.randomGrayPixel(0, 100))

util.toWindow({ model, view, params, colors25, linkColor, Color, util })

const perf = util.fps()
util.timeoutLoop(() => {
    model.step()
    model.tick()

    view.drawTurtles(model.turtles, (t, i) => ({
        sprite: view.spriteSheet.newSprite('dart', colors25[i % 25]),
        size: 2,
    }))
    view.drawLinks(model.links, { color: linkColor.webgl })
    view.draw()
    perf()
}, params.steps).then(() => {
    console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
    view.idle()
})
