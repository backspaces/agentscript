import AntsModel from '../../models/AntsModel.js'
import TwoDraw from '../../src/TwoDraw.js'
import Color from '../../src/Color.js'
import ColorMap from '../../src/ColorMap.js'

export const createAntsView = () => {
    let viewportWidth = window.innerWidth
    let viewportHeight = window.innerHeight
    let patchSize = 10
    let numPatchesWide = Math.ceil(viewportWidth / patchSize)
    let numPatchesTall = Math.ceil(viewportHeight / patchSize)

    let canvas = document.createElement('canvas')

    class LandingPageAntsModel extends AntsModel {
        constructor(worldOpts) {
            super(worldOpts)
            this.foodX = (world) => world.centerX - (world.maxX - world.minX) / 6,
            this.nestX = (world) => world.centerX + (world.maxX - world.minX) / 6
            this.diffusionRate = 0.3
            this.evaporationRate = 0.01
            this.speed = 1
        }
    }

    const model = new LandingPageAntsModel({
        minX: 0,
        maxX: numPatchesWide,
        minY: -Math.floor(numPatchesTall / 2),
        maxY: Math.ceil(numPatchesTall / 2)
    })
    
    model.setup()

    // Define colors and colormaps
    const nestColor = Color.typedColor('gold')
    const foodColor = Color.typedColor('blue')
    const nestColorMap = ColorMap.gradientColorMap(20, [
        'white',
        nestColor,
    ])
    const foodColorMap = ColorMap.gradientColorMap(20, [
        'white',
        foodColor,
    ])
    const drawOptions = {
        patchesColor: p => {
            // if (p.isNest) return nestColor
            // if (p.isFood) return foodColor
            return p.foodPheromone > p.nestPheromone
                ? foodColorMap.scaleColor(p.foodPheromone, 0, 1)
                : nestColorMap.scaleColor(p.nestPheromone, 0, 1)
        },
        turtlesShape: 'bug',
        turtlesSize: 3, // hide turtles
        turtlesColor: t => (t.carryingFood ? nestColor : foodColor),
    }

    const view = new TwoDraw(model, {
        div: canvas,
        useSprites: true,
        patchSize
    }, drawOptions)

    return view
}