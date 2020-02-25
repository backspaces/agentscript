import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'

const shape = 'bug'
const shapeSize = 3
const nestColor = Color.typedColor('yellow')
const foodColor = Color.typedColor('blue')
const nestColorMap = ColorMap.gradientColorMap(20, ['black', nestColor.css])
const foodColorMap = ColorMap.gradientColorMap(20, ['black', foodColor.css])
let nestSprite, foodSprite

const viewOptions = { div: 'modelDiv' }

function newView(model, options = {}) {
    const view = new ThreeView(model.world, Object.assign(viewOptions, options))
    // const view = new ThreeView(model.world)
    nestSprite = view.getSprite(shape, nestColor.css)
    foodSprite = view.getSprite(shape, foodColor.css)
    return view
}

function drawView(model, view) {
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
    // view.drawTurtles(model.turtles, t => ({
    //     shape: shape,
    //     color: t.carryingFood ? nestColor.css : foodColor.css,
    //     size: shapeSize,
    // }))

    view.render()
}

export default { newView, drawView }
