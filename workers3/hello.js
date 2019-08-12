import util from '../src/util.js'
import World from '../src/World.js'
import Color from '../src/Color.js'
import ThreeView from '../src/ThreeView.js'

const params = {
    seed: null,
    population: 100,
    maxX: 30,
    maxY: null,
    steps: 500,
    shapeSize: 2,
    world: null,
}
Object.assign(params, util.parseQueryString())
if (params.seed != null) util.randomSeed(params.seed)
if (params.maxY == null) params.maxY = params.maxX
params.world = World.defaultWorld(params.maxX, params.maxY)

const colors25 = util.repeat(25, (i, a) => {
    a[i] = Color.randomCssColor()
})
const linkColor = Color.typedColor(255, 255, 255)

const worker = new Worker('./helloWorker.js', { type: 'module' })
worker.postMessage({ cmd: 'init', params: params })

const view = new ThreeView(document.body, params.world)
// Just draw patches once:
view.createPatchPixels(i => Color.randomGrayPixel(0, 100))

util.toWindow({ view, worker, params, colors25, linkColor, Color, util })

const perf = util.fps()
worker.onmessage = e => {
    if (e.data === 'done') {
        console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
        view.idle()
    } else {
        view.drawTurtles(e.data.turtles, (t, i) => ({
            sprite: view.getSprite('dart', colors25[i % 25]),
            size: params.shapeSize,
        }))
        view.drawLinks(e.data.links, { color: linkColor.webgl })
        view.draw()
        worker.postMessage({ cmd: 'step' })
        perf()
    }
}
