import util from '../src/util.js'
import ThreeView from '../src/ThreeView.js'

const linkColor = 'black'
const shape = 'circle'
const shapeSize = 1
const shapeColor = 'red'

const viewOptions = {} // use defaults, div = document.body

let baseMapTile

function newView(model, options = {}) {
    const view = new ThreeView(model.world, Object.assign(viewOptions, options))

    const { Z, X, Y } = model.zxy
    const baseUrl = `https://tile.openstreetmap.org/${Z}/${X}/${Y}.png`
    util.imagePromise(baseUrl).then(img => (baseMapTile = img))

    return view
}

function drawView(model, view) {
    if (!baseMapTile) return // wait for image to load
    // view.drawPatchesImage(baseMapTile)
    view.drawPatchesImage(baseMapTile)

    view.drawLinks(model.links, { color: linkColor })
    view.drawTurtles(model.turtles, {
        shape: shape,
        color: shapeColor,
        size: shapeSize,
    })

    view.render()
}

export default { newView, drawView }
