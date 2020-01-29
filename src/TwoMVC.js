// Attempt to make the refactoring of AgentScript into many
// parts easier for the modeler.

import TwoView from './TwoView.js'
import Animator from './Animator.js'

export default class TwoMVC {
    static defaultOptions() {
        return {
            // Model
            // Note: world (undefined) defaults to ModelClass's default world.
            // Supplying your own world will override the model's default.
            world: undefined, // use model's default world

            // View
            div: document.body,
            useSprites: false,
            patchSize: 10,
        }
    }

    // constructor(ModelClass, div = document.body, world) {
    // options *override* the defaults above. Just put in ones that differ.
    constructor(ModelClass, options = {}) {
        options = Object.assign(TwoMVC.defaultOptions(), options)
        // Object.assign(this, options)
        // Object.assign(this, TwoMVC.defaultOptions(), options)
        // this.model = new ModelClass(this.world)
        this.model = new ModelClass(options.world)
        options.world = this.model.world
        // The view uses the model's resulting world
        // this.view = new TwoView(this.div, this.model.world)
        this.view = new TwoView(this.model, options)
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
