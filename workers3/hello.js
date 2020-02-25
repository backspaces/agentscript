import util from '../src/util.js'
import World from '../src/World.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'

const params = util.RESTapi({
    seed: false,
    population: 100,
    maxX: 30,
    maxY: 30,
    steps: 500,
    shapeSize: 2,
    world: null,
})
if (params.seed) util.randomSeed()
params.world = World.defaultWorld(params.maxX, params.maxY)

const colors = ColorMap.Basic16
const linkColor = Color.typedColor('white')

const worker = new Worker('./helloWorker.js', { type: 'module' })
worker.postMessage({ cmd: 'init', params: params })

const view = new ThreeView(params.world)
// Just draw patches once:
view.createPatchPixels(i => Color.randomGrayPixel(0, 100))

util.toWindow({ view, worker, params, colors, linkColor, Color, util })

const perf = util.fps() // Just for testing, not needed for production.
worker.onmessage = e => {
    if (e.data === 'done') {
        console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
        view.idle()
    } else {
        view.drawTurtles(e.data.turtles, (t, i) => ({
            sprite: view.getSprite('dart', colors.atIndex(i).css),
            size: params.shapeSize,
        }))
        view.drawLinks(e.data.links, { color: linkColor })
        view.render()
        worker.postMessage({ cmd: 'step' })
        perf()
    }
}
