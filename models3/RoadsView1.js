import util from '../src/util.js'
// import ThreeDraw from '../src/ThreeDraw.js'

// export default async function newView(model, viewOptions = {}) {
const { Z, X, Y } = model.zxy
const baseUrl = `https://tile.openstreetmap.org/${Z}/${X}/${Y}.png`

const baseMapTile = await util.imagePromise(baseUrl)

const isIntersection = t => t.breed.name === 'intersections'
const drawOptions = {
    patchesColor: baseMapTile,
    turtleShape: 'circle',
    turtlesColor: t => (isIntersection(t) ? 'blue' : 'red'),
    turtlesSize: t => (isIntersection(t) ? 2 : 1),
    linksColor: 'black',
}

//     return new ThreeDraw(model, viewOptions, drawOptions)
// }
