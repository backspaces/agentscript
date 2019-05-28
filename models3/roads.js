import util from '../src/util.js'
import World from '../src/World.js'
import Color from '../src/Color.js'
import ThreeView from '../src/ThreeView.js'
import RoadsModel from '../models/RoadsModel'

async function run() {
    const model = new RoadsModel(World.defaultWorld(100))
    await model.startup()
    model.setup()

    const view = new ThreeView(document.body, model.world)
    const { Z, X, Y } = model.zxy
    // osm is slooooow!
    // const baseUrl = `https://tile.openstreetmap.org/${Z}/${X}/${Y}.png`
    const baseUrl = `https://api.maptiler.com/maps/streets/${Z}/${X}/${Y}.png?key=iQurAP6lArV1UP4gfSVs`

    const baseMapTile = await util.imagePromise(baseUrl)
    const colors25 = util.repeat(25, (i, a) => {
        a[i] = Color.randomTypedColor().webgl
    })

    util.toWindow({ model, view, baseMapTile, colors25 })

    view.installDrawing(baseMapTile)
    view.drawTurtles(model.turtles, t => ({
        sprite: view.getSprite('circle', 'red'),
        size: t.links.length > 2 ? 1 : 0.5,
    }))
    view.drawLinks(model.links, l => ({
        color: colors25[l.lineString.properties.featureIndex % 25],
    }))
    view.draw()
    view.idle()
}

run().then(() => console.log('done'))
