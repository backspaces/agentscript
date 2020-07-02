import { HelloModelPlus as Model } from '../models/HelloModel.js'
import TwoMVC from './TwoMVC.js'
import util from '../src/util.js'

export default class HelloMVC extends TwoMVC {
    static defaultOptions() {
        return {
            modelOptions: {
                population: 1000,
            },

            viewOptions: {
                patchSize: 15,
            },

            // View parameters, used by draw() below
            shape: 'bug', // harder to draw, sprites help a LOT
            shapeSize: 2,
        }
    }

    // ======================

    constructor(viewOverrides) {
        super(Model, HelloMVC.defaultOptions(), viewOverrides)
        this.gui = this.setGUI()
    }

    draw() {
        // Draw the model world view w defaultDraw w/ our shape & shapeSize
        super.defaultDraw({ shape: this.shape, shapeSize: this.shapeSize })

        // Draw data to the gui:
        this.gui.perf = animator.ticksPerSec()
    }

    setGUI() {
        const { model, view, animator, mouse } = this
        util.toWindow({ model, view, animator, mouse })
        const template = {
            fps: {
                value: animator.fps,
                extent: [5, 60, 5],
                cmd: val => (animator.fps = val),
            },
            // fps: GUI.item(animator, 'fps', 20, [5, 60, 5]),
            speed: {
                value: model.speed,
                extent: [0.01, 0.5, 0.01],
                cmd: val => (model.speed = val),
            },
            wiggle: {
                value: model.wiggle,
                extent: [0, 1, 0.1],
                cmd: val => (model.wiggle = val),
            },
            patchSize: {
                value: view.patchSize,
                extent: [1, 20, 1],
                cmd: val => view.reset(val),
            },
            shape: {
                value: this.shape,
                extent: ['dart', 'circle', 'square', 'bug'],
                cmd: val => (this.shape = val),
            },
            shapeSize: {
                value: this.shapeSize,
                extent: [0.5, 5, 0.5],
                cmd: val => (this.shapeSize = val),
            },
            run: { value: () => animator.toggle() },
            useMouse: { value: true, cmd: val => mouse.run(val) },
            useSprites: {
                value: view.useSprites,
                cmd: val => (view.useSprites = val),
            },
            population: {
                value: model.population,
                extent: [5, 1000, 5],
                cmd: val => (model.population = val),
            },
            perf: { value: 0, cmd: 'listen' },
        }
        console.log(template)
        return super.setGUI(template)
    }

    handleMouse(mouse) {
        const turtles = this.model.turtles
        const { x, y } = mouse
        switch (mouse.action) {
            case 'down':
                this.selectedTurtle = turtles.closestTurtle(x, y, 2)
                if (this.selectedTurtle === null) return
                this.selectedTurtle.setxy(x, y)
                break
            case 'drag':
                if (this.selectedTurtle === null) return
                this.selectedTurtle.setxy(x, y)
                break
            case 'up':
                this.selectedTurtle = null
                break
        }
    }
}
