import util from '../src/util.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'
import DropletsModel from '../models/DropletsModel.js'

const timeoutMS = 2
const grayColorMap = ColorMap.grayColorMap()
const localMinColor = Color.typedColor(255, 0, 0)
const spriteShape = 'circle'
const spriteColor = 'yellow'
const spriteSize = 0.3

const world = DropletsModel.defaultWorld(50)
const model = new DropletsModel(world)
const view = new ThreeView(document.body, world)
const sprite = view.spriteSheet.newSprite(spriteShape, spriteColor)

util.toWindow({ model, view, util })

model.startup().then(() => {
    // model.stepType = 'minNeighbor'
    // model.killOffworld = true
    model.setup()
    const patchColors = getPatchColors()
    view.drawPatches(patchColors, c => c.pixel)

    const perf = util.fps()
    util.timeoutLoop(
        () => {
            model.step()
            model.tick()

            view.drawTurtles(model.turtles, { sprite, size: spriteSize })
            view.draw()
            perf()
        },
        500,
        timeoutMS
    ).then(() => {
        console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
        view.idle()
    })
})

function getPatchColors() {
    const patchElevations = model.patches.exportDataSet('elevation')
    const grays = patchElevations.scale(0, 255).data
    const colors = grays.map(d => grayColorMap[Math.round(d)])
    model.localMins.forEach(p => (colors[p.id] = localMinColor))
    return colors
}
