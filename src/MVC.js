// Attempt to make the refactoring of AgentScript into many
// parts easier for the modeler.
import Animator from '../src/Animator'
import World from './World'

export default class MVC {
    static defaultOptions() {
        return {
            population: 255,

            rate: 30,
            multiStep: false,

            div: 'model',
            viewOptions: {},

            useWorker: false,
        }
    }

    // ======================

    constructor(Model, View, world = World.defaultWorld(), options = {}) {
        // options: override defaults:
        options = Object.assign(MVC.defaultOptions(), options)
        Object.assign(this, { Model, View, world }, options)

        this.model = new Model(world)
        this.view = new View(this.div, world, this.viewOptions)
        this.animator = new Animator(
            this.model,
            this.view,
            this.rate,
            this.multiStep
        )
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

    run() {}
}
