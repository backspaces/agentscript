import Animator from '../src/Animator.js'

class RunModelView {
    constructor(Model, View, viewOptions = {}, drawOptions = {}) {
        Object.assign(this, { Model, View, viewOptions, drawOptions })
    }

    // world can be:
    //   undefined: usee Model's default world
    //   {min/maxX,Y,Z} object (World)
    //   or {bbox, patchesWidth} object (GeoWorld)
    //   or a World or GeoWorld instance
    // data can be:
    //   undefined (default)
    //   model specific data like bbox, tile zxy, zoom etc
    //   see DropletsModel.startup() for examples
    async setWorld(world = undefined, data = undefined) {
        const model = new this.Model(world)
        await model.startup(data)
        model.setup()

        const view = new this.View(model, this.viewOptions, this.drawOptions)
        const canvas = view.canvas
        world = model.world

        Object.assign(this, { model, view, world, canvas })
    }

    run(steps = 500, fps = 30) {
        if (this.anim) {
            if (this.anim.steps === -1) return
            this.anim.stop()
        }

        this.anim = new Animator(
            () => {
                this.model.step()
                this.view.draw()
            },
            steps, // number of steps, -1 to run forever
            fps // fps
        )
    }
}

export default RunModelView

// async resetWorld() {
//     if ((!this, model)) {
//         console.log('resetWorld() called without prior setWorld()')
//         return
//     }
//     await setWorld(model.world)
// }
