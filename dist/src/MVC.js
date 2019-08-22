// Attempt to make the refactoring of AgentScript into many
// parts easier for the modeler.

import Model from './Model.js'
import TwoView from './TwoView.js'
import Animator from './Animator.js'
import World from './World.js'
// import util from './util.js'

// export default class MVC {
export default class MVC extends Model {
    constructor(div = document.body, world = World.defaultWorld()) {
        super(world)
        Object.assign(this, { div, world })
        // this.model = new this(world)
        this.view = new TwoView(this.div, world)
        this.animator = new Animator(this)
    }

    // draw() {}
    // step() {}

    start() {
        this.animator.start()
    }
    stop() {
        this.animator.stop()
    }
    once() {
        this.animator.once()
    }
    fps() {
        return this.animator.fps
    }
}
