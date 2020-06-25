import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import ThreeDraw from '../src/ThreeDraw.js'

export default function newView(model, viewOptions = {}) {
    const nestColor = Color.typedColor('yellow')
    const foodColor = Color.typedColor('blue')
    const nestColorMap = ColorMap.gradientColorMap(20, ['black', nestColor.css])
    const foodColorMap = ColorMap.gradientColorMap(20, ['black', foodColor.css])

    const drawOptions = {
        patchColor: p => {
            if (p.isNest) return nestColor.pixel
            if (p.isFood) return foodColor.pixel
            return p.foodPheromone > p.nestPheromone
                ? foodColorMap.scaleColor(p.foodPheromone, 0, 1).pixel
                : nestColorMap.scaleColor(p.nestPheromone, 0, 1).pixel
        },
        turtleShape: 'bug',
        turtleSize: 3,
        turtleColor: t => (t.carryingFood ? nestColor.css : foodColor.css),
    }

    const view = new ThreeDraw(model, viewOptions, drawOptions)
    return view
}
