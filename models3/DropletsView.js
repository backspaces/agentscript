import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'

const shape = 'circle'
const shapeColor = 'yellow'
const shapeSize = 0.5
const grayColorMap = ColorMap.grayColorMap()
const localMinColor = Color.typedColor(255, 0, 0) // 'red'

// const sprite = view.getSprite(params.shape, params.shapeColor)
let sprite

const viewOptions = { div: 'modelDiv' }

function newView(model, options = {}) {
    const view = new ThreeView(model.world, Object.assign(viewOptions, options))
    sprite = view.getSprite(shape, shapeColor)
    // Draw patches only once
    const patchColors = getPatchColors(model)
    view.drawPatches(patchColors, color => color.pixel)
    return view
}
function getPatchColors(model) {
    const elevation = model.patches.exportDataSet('elevation')
    const grays = elevation.scale(0, 255).data
    const colors = grays.map(d => grayColorMap[Math.round(d)])
    model.localMins.forEach(p => (colors[p.id] = localMinColor))
    return colors
}

function drawView(model, view) {
    // Note this uses constant values, thus are an object, not function.
    view.drawTurtles(model.turtles, {
        sprite: sprite,
        size: shapeSize,
    })
    // Both drawTurtles work
    // view.drawTurtles(model.turtles, {
    //     shape: shape,
    //     color: shapeColor,
    //     size: shapeSize,
    // })

    view.render()
}

export default { newView, drawView }
