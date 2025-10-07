import TwoDraw from '/src/TwoDraw.js'
import ColorMap from '/src/ColorMap.js'

export default function (model, div = 'modelDiv') {
    return new TwoDraw(model, {
        div,
        patchSize: 6,
        drawOptions: {
            turtlesShape: 'square',
            turtlesRotate: false,
            turtlesSize: 0.8,
            turtlesColor: 'yellow',
            initPatches: (model, view) => {
                const elevation = model.patches.exportDataSet('elevation')
                const grays = elevation.scale(0, 255).data
                const colors = grays.map(d => ColorMap.Gray[Math.round(d)])
                return colors
            },
        },
    })
}
