// Attempt to make the refactoring of AgentScript into many
// parts easier for the modeler.

import Model from '../src/Model.js'
import TwoView from '../src/TwoView.js'
import Animator from '../src/Animator.js'
import World from '../src/World.js'
// import util from './util.js'

// export default class MVC {
export default class MVC extends Model {
    constructor(div = document.body, world = World.defaultWorld()) {
        super(world)
        Object.assign(this, { div, world })
        // this.model = new this(world)
        this.view = new TwoView(div, world)
        this.animator = new Animator(this)
    }

    // MVC model must override these:
    draw() {
        console.log('Oops: override draw in your MVC subclass')
    }
    step() {
        console.log('Oops: override step in your MVC subclass')
    }

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
