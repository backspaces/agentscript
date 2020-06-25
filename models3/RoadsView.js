import util from '../src/util.js'
import ThreeDraw from '../src/ThreeDraw.js'

export default async function newView(model, viewOptions = {}) {
    const { Z, X, Y } = model.zxy
    const baseUrl = `https://tile.openstreetmap.org/${Z}/${X}/${Y}.png`

    const baseMapTile = await util.imagePromise(baseUrl)

    const isIntersection = t => t.breed.name === 'intersections'
    const drawOptions = {
        patchColor: baseMapTile,
        turtleShape: 'circle',
        turtleColor: t => (isIntersection(t) ? 'blue' : 'red'),
        turtleSize: t => (isIntersection(t) ? 2 : 1),
        linkColor: 'black',
    }

    return new ThreeDraw(model, viewOptions, drawOptions)
}
