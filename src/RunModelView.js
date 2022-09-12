import * as util from '../src/utils.js'
import GeoWorld from '../src/GeoWorld.js'
import Model from '../models/HelloModel.js'
import TwoDraw from '../src/TwoDraw.js'
import Animator from '../src/Animator.js'
// console.log( Model, TwoDraw, Animator)

class RunModelView {
    constructor(Model, View = TwoDraw, viewOptions = {}, drawOptions = {}) {
        Object.assign(this, { Model, View, viewOptions, drawOptions })
    }
    async run(world = undefined) {
        if (this.anim) anim.stop

        const model = new this.Model(world)
        await model.startup()
        model.setup()

        const view = new this.View(model, this.viewOptions, this.drawOptions)

        const anim = new Animator(
            () => {
                model.step()
                view.draw()
            },
            500, // number of steps, -1 to run forever
            30 // fps
        )

        Object.assign(this, { model, view, anim })
        return this
    }
}
export default RunModelView

// const viewOptions = {
//     div: util.createCanvas(0, 0),
// }
// const drawOptions = {
//     patchesColor: 'transparent',
// }

// const bbox = [-107.008305, 33.9974066, -103.77768, 36.995954]
// const world = new GeoWorld({ bbox, patchesWidth: 50 })
// const model = new Model(world)
// await model.startup()
// model.setup()

// const view = new TwoDraw(model, viewOptions, drawOptions)

// const anim = new Animator(
//     () => {
//         model.step()
//         view.draw()
//     },
//     500, // run n steps, -1 for forever
//     30 // 30 fps
// )

// util.toWindow({ model, view, anim })

// export default { model, view, anim }
