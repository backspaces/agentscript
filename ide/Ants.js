import AntsModel from 'https://code.agentscript.org/models/AntsModel.js'
import Color from 'https://code.agentscript.org/src/Color.js'
import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

const inset = 3
export class Model extends AntsModel {
    foodX = world => world.minX + world.numX / inset
    nestX = world => world.maxX - world.numX / inset
    // name = 'Ants'
}

export const patchSize = 10

// const nestColor = Color.typedColor('yellow')
const nestColor = Color.typedColor('orange')
const foodColor = Color.typedColor('blue')
const nestColorMap = ColorMap.gradientColorMap(20, ['white', nestColor])
const foodColorMap = ColorMap.gradientColorMap(20, ['white', foodColor])

export const drawOptions = {
    patchesColor: p => {
        if (p.isNest) return nestColor
        if (p.isFood) return foodColor
        return p.foodPheromone > p.nestPheromone
            ? foodColorMap.scaleColor(p.foodPheromone, 0, 1)
            : nestColorMap.scaleColor(p.nestPheromone, 0, 1)
    },
    turtlesShape: 'bug',
    turtlesSize: 5,
    turtlesColor: t => (t.carryingFood ? nestColor : foodColor),
}

export default { Model, patchSize, drawOptions }
