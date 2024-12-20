import Color from 'https://code.agentscript.org/src/Color.js'
import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

export default function TwoDrawOptions(div, model, patchSize = 10) {
    const drawOptions = {
        turtlesShape: 'square',
        turtlesRotate: false,
        turtlesSize: 0.8,
        turtlesColor: 'yellow',
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

    // many turtle shapes difficult to draw, use small images
    return { div, useSprites: true, patchSize, drawOptions }
}
