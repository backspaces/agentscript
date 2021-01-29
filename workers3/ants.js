import * as util from '../src/utils.js'
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
})
if (params.seed) util.randomSeed()
params.world = World.defaultOptions(params.maxX, params.maxY)

const nestColor = Color.typedColor('yellow')
const foodColor = Color.typedColor('blue')
const nestColorMap = ColorMap.gradientColorMap(20, ['black', nestColor.css])
const foodColorMap = ColorMap.gradientColorMap(20, ['black', foodColor.css])

const worker = new Worker('./antsWorker.js', { type: 'module' })
worker.postMessage({ cmd: 'init', params: params })

const view = new ThreeView(params.world)
const nestSprite = view.getSprite('bug', nestColor.css)
const foodSprite = view.getSprite('bug', foodColor.css)
util.toWindow({ view, worker, params, util })

const perf = util.fps() // Just for testing, not needed for production.
worker.onmessage = e => {
    if (e.data === 'done') {
        console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
        view.idle()
    } else {
        view.drawPatches(e.data.patches, p => {
            if (p.isNest) return nestColor.pixel
            if (p.isFood) return foodColor.pixel
            const color =
                p.foodPheromone > p.nestPheromone
                    ? foodColorMap.scaleColor(p.foodPheromone, 0, 1)
                    : nestColorMap.scaleColor(p.nestPheromone, 0, 1)
            return color.pixel
        })
        view.drawTurtles(e.data.turtles, t => ({
            sprite: t.carryingFood ? nestSprite : foodSprite,
            size: params.shapeSize,
        }))
        view.render()
        worker.postMessage({ cmd: 'step' })
        perf()
    }
}

// util.timeoutLoop(() => {
//     model.step()

//     view.drawPatches(model.patches, p => {
//         if (p.isNest) return nestColor.pixel
//         if (p.isFood) return foodColor.pixel
//         const color =
//             p.foodPheromone > p.nestPheromone
//                 ? foodColorMap.scaleColor(p.foodPheromone, 0, 1)
//                 : nestColorMap.scaleColor(p.nestPheromone, 0, 1)
//         return color.pixel
//     })

//     view.drawTurtles(model.turtles, t => ({
//         sprite: t.carryingFood ? nestSprite : foodSprite,
//         size: params.shapeSize,
//     }))

//     view.render()
//     perf()
// }, 500).then(() => {
//     console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
//     view.idle()
// })
