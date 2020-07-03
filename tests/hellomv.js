import World from '../src/World.js'
import util from '../src/util.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'
import HelloModel from '../models/HelloModel.js'

// import util from 'https://backspaces.github.io/agentscript/src/util.js'
// import World from 'https://backspaces.github.io/agentscript/src/World.js'
// import Color from 'https://backspaces.github.io/agentscript/src/Color.js'
// import TwoView from 'https://backspaces.github.io/agentscript/src/TwoView.js'
// import HelloModel from 'https://backspaces.github.io/agentscript/models/HelloModel.js'

const params = util.RESTapi({
    // Model
    seed: false,
    population: 100,
    maxX: 30,
    maxY: 30,

    // TwoView
    patchSize: 10,
    div: 'modelDiv',
    useSprites: false,

    // This model's View parameters
    linksColor: 'white', // css
    shape: 'dart',
    shapeSize: 2,

    // How long to run: negative => forever
    steps: 500,
})
if (params.seed) util.randomSeed()

const world = World.defaultOptions(params.maxX, params.maxY)
const colors = ColorMap.Basic16

const model = new HelloModel(world)
model.population = params.population
model.setup()

const view = new TwoView(world, {
    useSprites: params.useSprites,
    patchSize: params.patchSize,
    div: params.div,
})

util.toWindow({ model, view, params, colors, Color, util })

// Just create patches colors once, random gray in [0, 100)
view.createPatchPixels(i => Color.randomGrayPixel(0, 100))

const perf = util.fps() // Just for testing, not needed for production.
util.timeoutLoop(() => {
    model.step()
    model.tick()

    view.clear()
    view.drawPatches() // redraw patches colors

    view.drawLinks(model.links, { color: params.linksColor, width: 1 })
    view.drawTurtles(model.turtles, t => ({
        shape: params.shape,
        color: colors.atIndex(t.id).css, // atIndex wraps to stay w/in map
        size: params.shapeSize,
    }))
    perf()
}, params.steps).then(() => {
    console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
})
