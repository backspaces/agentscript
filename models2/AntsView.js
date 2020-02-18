import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import TwoView from '../src/TwoView.js'

const shape = 'bug'
const shapeSize = 3
const nestColor = Color.typedColor('yellow')
const foodColor = Color.typedColor('blue')
const nestColorMap = ColorMap.gradientColorMap(20, ['black', nestColor.css])
const foodColorMap = ColorMap.gradientColorMap(20, ['black', foodColor.css])

const viewOptions = { useSprites: true } // bugs hard to draw, sprites faster

function newView(model, options = {}) {
    return new TwoView(model.world, Object.assign(viewOptions, options))
}

function drawView(model, view) {
    // view.clear()
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
        shape: shape,
        color: t.carryingFood ? nestColor.css : foodColor.css,
        size: shapeSize,
    }))
}

export default { newView, drawView }
