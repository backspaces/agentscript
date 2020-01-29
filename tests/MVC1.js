// Attempt to make the refactoring of AgentScript into many
// parts easier for the modeler.

import TwoView from '../src/TwoView.js'
import Animator from '../src/Animator.js'
import World from '../src/World.js'

export default class MVC1 {
    constructor(ModelClass, div = document.body, world = World.defaultWorld()) {
        // Object.assign(this, { ModelClass, div, world })
        this.model = new ModelClass(world)
        this.view = new TwoView(div, world)
        this.animator = new Animator(this)
    }

    // Model methods
    async startup() {
        await this.model.startup()
    }
    setup() {
        this.model.setup()
    }
    step() {
        this.model.step()
    }
    // Called by animator. Add to step? Use local in animator?
    tick() {
        this.model.tick()
    }

    // MVC View must override draw:
    draw() {
        console.log('Oops: override draw in your MVC subclass')
    }

    // Animator methods
    start() {
        this.animator.start()
    }
    stop() {
        this.animator.stop()
    }
    once() {
        this.animator.once()
    }

    get fps() {
        return this.animator.fps()
    }
    set fps(fps) {
        this.animator.fps = fps
    }
}
