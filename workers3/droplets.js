import util from '../src/util.js'
import DataSet from '../src/DataSet.js'
import RGBDataSet from '../src/RGBDataSet.js'
import World from '../src/World.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'
util.toWindow({ util, DataSet, RGBDataSet, World, Color, ColorMap, ThreeView })

const params = util.RESTapi({
    seed: false,
    maxX: 50,
    maxY: 50,
    steps: 500,
    shape: 'circle',
    shapeColor: 'yellow',
    shapeSize: 0.5,
    world: null,
    tile:
        'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/13/1594/3339.png',
    // have main manage tile => elevation. Worker can't, uses Image
    elevation: null,
})
if (params.seed) util.randomSeed()
params.world = World.defaultWorld(params.maxX, params.maxY)

util.imagePromise(params.tile).then(png => {
    params.elevation = new RGBDataSet(png, -32768, 1 / 256)

    const grayColorMap = ColorMap.grayColorMap()
    const localMinColor = Color.typedColor(255, 0, 0)

    const worker = new Worker('./dropletsWorker.js', { type: 'module' })
    worker.postMessage({ cmd: 'init', params: params })

    const view = new ThreeView(document.body, params.world)
    const sprite = view.getSprite(params.shape, params.shapeColor)
    util.toWindow({ view, worker, params })

    const perf = util.fps() // Just for testing, not needed for production.
    worker.onmessage = e => {
        if (e.data === 'done') {
            console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
            view.idle()
        } else {
            // e.data.patches used just once on first step
            if (e.data.patches) {
                const patchColors = getPatchColors(
                    e.data.patches.elevation,
                    e.data.model.localMins
                )
                view.drawPatches(patchColors, c => c.pixel)
            }
            view.drawTurtles(e.data.turtles, { sprite, size: params.shapeSize })
            view.draw()
            worker.postMessage({ cmd: 'step' })
            perf()
        }
    }
    function getPatchColors(elevations, localMins) {
        const { width, height } = params.world
        // Convert dataset from typedarray to Array for grays.map below
        const dataset = new DataSet(width, height, Array.from(elevations))
        const grays = dataset.scale(0, 255).data
        const colors = grays.map(d => grayColorMap[Math.round(d)])
        localMins.forEach(id => (colors[id] = localMinColor))
        return colors
    }
})
