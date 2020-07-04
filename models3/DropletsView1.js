import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
// import ThreeDraw from '../src/ThreeDraw.js'

const grayColorMap = ColorMap.grayColorMap()
const localMinColor = Color.typedColor(255, 0, 0) // 'red'
function getPatchColors(model) {
    const elevation = model.patches.exportDataSet('elevation')
    const grays = elevation.scale(0, 255).data
    const colors = grays.map(d => grayColorMap[Math.round(d)])
    model.localMins.forEach(p => (colors[p.id] = localMinColor))
    return colors
}

// export default function newView(model, viewOptions = {}) {
const drawOptions = {
    turtleShape: 'circle',
    turtlesColor: 'yellow',
    turtlesSize: 0.5,
    initPatches: (model, view) => getPatchColors(model),
}

export default drawOptions

// const view = new ThreeDraw(model, viewOptions, drawOptions)
// return view
// }
