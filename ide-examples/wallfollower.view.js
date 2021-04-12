import Color from '../src/Color.js'
import View from '../src/TwoDraw.js'

const wallsColor = Color.typedColor(222, 184, 135)
const backgroundColor = Color.typedColor('black')

const viewOpts = {
    drawOptions: {
        patchesColor: p =>
            p.breed.name === 'walls' ? wallsColor : backgroundColor,
        turtlesShape: 'dart',
        turtlesSize: 2,
        turtlesColor: t => (t.breed.name === 'lefty' ? 'green' : 'red'),
    }
}

const worldOpts = {
    minX: -35,
    maxX: 35,
    minY: -35,
    maxY: 35
}

export { View, viewOpts, worldOpts }
