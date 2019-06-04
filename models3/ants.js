import World from '../src/World.js'
import util from '../src/util.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'
import AntsModel from '../models/AntsModel.js'
util.toWindow({ util, Color, ColorMap, ThreeView, AntsModel })

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

const nestColor = Color.toTypedColor('yellow')
const foodColor = Color.toTypedColor('blue')
const nestColorMap = ColorMap.gradientColorMap(20, ['black', nestColor.css])
const foodColorMap = ColorMap.gradientColorMap(20, ['black', foodColor.css])

const model = new AntsModel(params.world)
model.population = params.population
model.setup()

const view = new ThreeView(document.body, params.world)
const nestSprite = view.getSprite('bug', nestColor.css)
const foodSprite = view.getSprite('bug', foodColor.css)
util.toWindow({ model, view })

const perf = util.fps()
util.timeoutLoop(() => {
    model.step()
    model.tick()

    view.drawPatches(model.patches, p => {
        if (p.isNest) return nestColor.pixel
        if (p.isFood) return foodColor.pixel
        const color =
            p.foodPheromone > p.nestPheromone
                ? foodColorMap.scaleColor(p.foodPheromone, 0, 1)
                : nestColorMap.scaleColor(p.nestPheromone, 0, 1)
        return color.pixel
    })

    view.drawTurtles(model.turtles, t => ({
        sprite: t.carryingFood ? nestSprite : foodSprite,
        size: params.shapeSize,
    }))

    view.draw()
    perf()
}, params.steps).then(() => {
    console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
    view.idle()
})
