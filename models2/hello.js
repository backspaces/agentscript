import World from '../src/World.js'
import util from '../src/util.js'
import Color from '../src/Color.js'
import TwoView from '../src/TwoView.js'
import HelloModel from '../models/HelloModel.js'

const params = {
    seed: null,
    population: 100,
    maxX: 30,
    maxY: null,
    steps: 500,
    linkColor: 'white', // css
    shape: 'dart',
    shapeSize: 2,
    patchSize: 10,
    world: null,
}
Object.assign(params, util.parseQueryString())
if (params.seed != null) util.randomSeed(params.seed)
if (params.maxY == null) params.maxY = params.maxX
params.world = World.defaultOptions(params.maxX, params.maxY)

const colors25 = util.repeat(25, (i, a) => {
    a[i] = Color.randomCssColor()
})

const model = new HelloModel(params.world)
model.population = params.population
model.setup()

const view = new TwoView('modelDiv', params.world, {
    useSprites: true,
    patchSize: params.patchSize,
})

util.toWindow({ model, view, params, colors25, Color, util })

// Just create patches colors once:
view.createPatchPixels(i => Color.randomGrayPixel(0, 100))
const perf = util.fps()
util.timeoutLoop(() => {
    model.step()
    model.tick()

    view.clear()
    view.drawPatches() // redraw patches colors

    view.drawLinks(model.links, { color: params.linkColor, width: 1 })
    view.drawTurtles(model.turtles, p => ({
        shape: params.shape,
        color: colors25[p.id % 25],
        size: params.shapeSize,
    }))
    perf()
}, params.steps).then(() => {
    console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
})
