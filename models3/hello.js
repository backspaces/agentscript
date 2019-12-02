import World from '../src/World.js'
import util from '../src/util.js'
import Color from '../src/Color.js'
import ThreeView from '../src/ThreeView.js'
import HelloModel from '../models/HelloModel.js'

const params = util.RESTapi({
    seed: false,
    population: 100,
    maxX: 30,
    maxY: 30,
    steps: 500,
    linkColor: 'white', // css converted to webgl color below
    shape: 'dart',
    shapeSize: 2,
    world: null,
})
if (params.seed) util.randomSeed()
params.world = World.defaultOptions(params.maxX, params.maxY)
params.linkColor = Color.toTypedColor(params.linkColor).webgl // webgl 0-1 color

const colors25 = util.repeat(25, (i, a) => {
    a[i] = Color.randomCssColor()
})

const model = new HelloModel(params.world)
model.population = params.population
model.setup()

const view = new ThreeView(document.body, params.world)

util.toWindow({ model, view, params, colors25, Color, util })

// Just create patches colors once:
view.createPatchPixels(i => Color.randomGrayPixel(0, 100))
const perf = util.fps()
util.timeoutLoop(() => {
    model.step()
    model.tick()

    view.drawTurtles(model.turtles, (t, i) => ({
        sprite: view.getSprite(params.shape, colors25[i % 25]),
        size: params.shapeSize,
    }))
    view.drawLinks(model.links, { color: params.linkColor })
    view.draw()
    perf()
}, params.steps).then(() => {
    console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
    view.idle()
})
