import View from '../src/TwoDraw.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'

const viewOpts = {
    useSprites: true,
    drawOptions: {
        turtlesShape: 'circle',
        turtlesColor: 'yellow',
        turtlesSize: 0.5,
        initPatches: (model, view) => {
            const elevation = model.patches.exportDataSet('elevation')
            const grays = elevation.scale(0, 255).data
            const colors = grays.map(d => ColorMap.Gray[Math.round(d)])
            const localMinColor = Color.typedColor(255, 0, 0)
            model.localMins.forEach(p => {
                colors[p.id] = localMinColor
            })
            return colors
        },
    }
}

const worldOpts = {
    minX: -50,
    maxX: 50,
    minY: -50,
    maxY: 50
}

export { View, viewOpts, worldOpts }
