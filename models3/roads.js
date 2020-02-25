import util from '../src/util.js'
import World from '../src/World.js'
import ThreeView from '../src/ThreeView.js'
import RoadsModel from '../models/RoadsModel.js'

async function run() {
    const model = new RoadsModel(World.defaultOptions(100))
    await model.startup()
    model.setup()

    const view = new ThreeView(model)
    const { Z, X, Y } = model.zxy
    // osm can be slooooow! use maptiler if a problem
    const baseUrl = `https://tile.openstreetmap.org/${Z}/${X}/${Y}.png`
    // const baseUrl = `https://api.maptiler.com/maps/streets/${Z}/${X}/${Y}.png?key=iQurAP6lArV1UP4gfSVs`

    const baseMapTile = await util.imagePromise(baseUrl)

    util.toWindow({ model, view, baseMapTile })

    view.installDrawing(baseMapTile)
    view.drawTurtles(model.turtles, t => ({
        sprite: view.getSprite('circle', 'red'),
        size: t.links.length > 2 ? 1 : 0.5,
    }))
    view.drawLinks(model.links, {
        color: 'black',
    })
    view.render()
    view.idle()
}

run().then(() => console.log('done'))
