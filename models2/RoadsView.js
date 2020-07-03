import util from '../src/util.js'
import TwoView from '../src/TwoView.js'

const linksColor = 'black'
// const tripColor = 'green'
const shape = 'circle'
// const shapeSize = 1

const nodeColor = 'red'
const intersectionColor = 'blue'
const nodeSize = 1
const intersectionSize = 2

const viewOptions = { patchSize: 4 }

let baseMapTile

function newView(model, options = {}) {
    const view = new TwoView(model.world, Object.assign(viewOptions, options))

    const { Z, X, Y } = model.zxy
    const baseUrl = `https://tile.openstreetmap.org/${Z}/${X}/${Y}.png`
    util.imagePromise(baseUrl).then(img => (baseMapTile = img))

    return view
}

const isIntersection = t => t.breed.name === 'intersections'
// const isTrip = l => l.agentSet.name === 'trips'
function drawView(model, view) {
    if (!baseMapTile) return // wait for image to load
    view.drawPatchesImage(baseMapTile)

    view.drawLinks(model.links, l => ({
        // color: isTrip(l) ? tripColor : linksColor,
        color: linksColor,
    }))
    view.drawTurtles(model.turtles, t => ({
        shape: shape,
        color: isIntersection(t) ? intersectionColor : nodeColor,
        size: isIntersection(t) ? intersectionSize : nodeSize,
    }))
}

export default { newView, drawView }
