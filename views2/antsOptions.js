import Color from 'https://code.agentscript.org/src/Color.js'
import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

export default function TwoDrawOptions(div, model, patchSize = 10) {
    const nestColor = Color.typedColor('yellow')
    const foodColor = Color.typedColor('blue')
    const nestColorMap = ColorMap.gradientColorMap(20, ['black', nestColor])
    const foodColorMap = ColorMap.gradientColorMap(20, ['black', foodColor])

    const drawOptions = {
        patchesColor: p => {
            if (p.isNest) return nestColor
            if (p.isFood) return foodColor
            return p.foodPheromone > p.nestPheromone
                ? foodColorMap.scaleColor(p.foodPheromone, 0, 1)
                : nestColorMap.scaleColor(p.nestPheromone, 0, 1)
        },
        turtlesShape: 'bug',
        turtlesSize: 3,
        turtlesColor: t => (t.carryingFood ? nestColor : foodColor),
    }

    // ant shape difficult to draw, use sprites, small images
    return { div, useSprites: true, patchSize, drawOptions }
}
