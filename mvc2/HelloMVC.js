// import HelloModel from '../models/HelloModel.js'
import { HelloModelPlus as Model } from '../models/HelloModel.js'
import TwoMVC from './TwoMVC.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
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
            linkColor: 'rgba(255,255,255,0.25',
            shape: 'bug', // harder to draw, sprites help a LOT
            shapeSize: 2,
            colorMap: ColorMap.Basic16,
        }
    }

    // ======================

    constructor(viewOverrides) {
        super(Model, HelloMVC.defaultOptions(), viewOverrides)
        this.gui = this.setGUI()
    }

    draw() {
        const { model, view, animator, gui } = this

        // Draw the model world view
        // Just draw patches once, results cached in view.patchesView
        if (animator.draws === 0) {
            view.createPatchPixels(i => Color.randomGrayPixel(0, 100))
        }

        // view.clear()
        view.drawPatches() // redraw cached patches colors

        view.drawLinks(model.links, { color: this.linkColor, width: 1 })
        view.drawTurtles(model.turtles, p => ({
            shape: this.shape,
            color: this.colorMap.atIndex(p.id).css,
            size: this.shapeSize,
        }))

        // Draw data to the gui:
        gui.perf = animator.ticksPerSec()
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
        const { xCor, yCor } = mouse
        switch (mouse.action) {
            case 'down':
                this.selectedTurtle = turtles.closestTurtle(xCor, yCor, 2)
                if (this.selectedTurtle === null) return
                this.selectedTurtle.setxy(xCor, yCor)
                break
            case 'drag':
                if (this.selectedTurtle === null) return
                this.selectedTurtle.setxy(xCor, yCor)
                break
            case 'up':
                this.selectedTurtle = null
                break
        }
    }
}
