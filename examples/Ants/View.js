import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
// import Color from 'https://code.agentscript.org/src/Color.js'
import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

const nestColor = 'yellow'
const foodColor = 'blue'
// const nestColor = Color.typedColor('yellow')
// const foodColor = Color.typedColor('blue')

const nestColorMap = ColorMap.gradientColorMap(20, ['black', nestColor])
const foodColorMap = ColorMap.gradientColorMap(20, ['black', foodColor])

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 6.5,
        drawOptions: {
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
        },
    })
}
