import View from '../src/TwoDraw.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'

// Define colors and colormaps
const nestColor = Color.typedColor('yellow')
const foodColor = Color.typedColor('blue')
const nestColorMap = ColorMap.gradientColorMap(20, [
    'black',
    nestColor,
])
const foodColorMap = ColorMap.gradientColorMap(20, [
    'black',
    foodColor,
])
const viewOpts = {
    useSprites: true, // ant shape difficult to draw
    width: 700,
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
    }
}

const worldOpts = {
    minX: -40,
    maxX: 40,
    minY: -40,
    maxY: 40
}

export { View, viewOpts, worldOpts }