import Animator from '../src/Animator.js'

class RunModelView {
    constructor(Model, View, viewOptions = {}, drawOptions = {}) {
        Object.assign(this, { Model, View, viewOptions, drawOptions })
    }
    async run(world = undefined) {
        // undefined: use model's default
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
