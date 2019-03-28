import util from '../src/util.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'
import AntsModel from '../models/AntsModel.js'

const timeoutMS = 0
const shapeSize = 2
const nestColor = Color.toTypedColor('yellow')
const foodColor = Color.toTypedColor('blue')
const nestColorMap = ColorMap.gradientColorMap(20, ['black', nestColor.css])
const foodColorMap = ColorMap.gradientColorMap(20, ['black', foodColor.css])

const worldOptions = AntsModel.defaultWorld(40)
const model = new AntsModel(worldOptions)
model.setup()

const view = new ThreeView(document.body, worldOptions)
const nestSprite = view.getSprite('bug', nestColor.css)
const foodSprite = view.getSprite('bug', foodColor.css)
util.toWindow({ model, view, util })

const perf = util.fps()
util.timeoutLoop(
    () => {
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
            size: shapeSize,
        }))

        view.draw()
        perf()
    },
    500,
    timeoutMS
).then(() => {
    console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
    view.idle()
})
