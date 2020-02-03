// Attempt to make the refactoring of AgentScript into many
// parts easier for the modeler.

import TwoView from './TwoView.js'
import Animator from './Animator.js'
import util from './util.js'

export default class TwoMVC {
    static defaultOptions() {
        return {
            // Model
            // Note: world (undefined) defaults to ModelClass's default world.
            // Supplying your own world will override the model's default.
            // world: undefined, // undefined => use model's default world

            // View
            div: document.body,
            useSprites: false,
            patchSize: 10,
        }
    }

    // options *override* the defaults above. Just put in ones that differ.
    constructor(model, options = {}) {
        options = Object.assign(TwoMVC.defaultOptions(), options)

        const modelDefaults = model.constructor.defaultOptions()
        Object.assign(model, this.override(modelDefaults, options))
        this.model = model

        const viewDefaults = TwoView.defaultOptions()
        this.view = new TwoView(
            this.model,
            this.override(viewDefaults, options)
        )

        this.animator = new Animator(this)
    }
    override(defaults, options) {
        const overrides = defaults
        util.forLoop(defaults, (val, key) => {
            if (options[key]) {
                overrides[key] = options[key]
            }
        })
        return overrides
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
        return this.animator.fps
    }
    set fps(fps) {
        this.animator.fps = fps
    }
}
