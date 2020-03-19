// Attempt to make the refactoring of AgentScript into many
// parts easier for the modeler.

import TwoView from '../src/TwoView.js'
import Animator from '../src/Animator.js'
import GUI from '../src/GUI.js'
import Mouse from '../src/Mouse.js'
import util from '../src/util.js'

export default class TwoMVC {
    static defaultOptions() {
        return {
            // use model's default world
            worldOptions: undefined,

            // override any of this models options
            modelOptions: {
                // population: 1000 .. a common override
            },
            // override any of the view options:
            viewOptions: {
                // div: document.body,
                // useSprites: false,
                // patchSize: 10,
            },
            // drawOptions: {
            //     //
            // },
        }
    }

    // options *override* the defaults above. Just put in ones that differ.
    constructor(modelClass, options, viewOptions = {}) {
        // options = Object.assign(TwoMVC.defaultOptions(), options)

        // const modelDefaults = model.constructor.defaultOptions()
        // Object.assign(model, util.override(modelDefaults, options))
        this.model = new modelClass(options.worldOptions)
        Object.assign(this.model, options.modelOptions)

        Object.assign(options.viewOptions, viewOptions)
        this.view = new TwoView(this.model.world, options.viewOptions)

        this.animator = new Animator(this)

        this.mouse = new Mouse(
            this.view.canvas,
            this.model.world,
            this.handleMouse
        ).start()

        const defaultKeys = Object.keys(TwoMVC.defaultOptions())
        const keys = Object.keys(options)
        const drawKeys = util.difference(keys, defaultKeys)
        // export function assign(to, from, keys) {
        // console.log(drawKeys)
        util.assign(this, options, drawKeys)
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

    setGUI(template) {
        return new GUI(template).target
    }

    handleMouse(mouse) {
        util.warn('no mouse handler')
    }
}
