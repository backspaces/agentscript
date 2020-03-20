// import HelloModel from '../models/HelloModel.js'
import Model from '../models/VirusModel.js'
import TwoMVC from './TwoMVC.js'
// import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import util from '../src/util.js'

export default class HelloMVC extends TwoMVC {
    static defaultOptions() {
        return {
            modelOptions: {
                population: 1000,
            },

            viewOptions: {
                patchSize: 8,
            },

            // View parameters, used by draw() below
            linkColor: 'rgba(255,255,255,0.25',
            shape: 'circle',
            shapeSize: 1,
            turtleColors: {
                infected: 'red',
                susceptible: 'blue',
                resistant: 'gray',
            },
        }
    }

    // ======================

    constructor(viewOverrides) {
        super(Model, HelloMVC.defaultOptions(), viewOverrides)
        this.gui = this.setGUI()
    }

    draw() {
        const { model, view, linkColor, shape, turtleColors, shapeSize } = this

        // Draw the model world view
        view.clear('black')

        view.drawLinks(model.links, { color: linkColor, width: 1 })
        view.drawTurtles(model.turtles, t => ({
            shape: shape,
            color: turtleColors[t.state],
            size: shapeSize,
        }))

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
            patchSize: {
                value: view.patchSize,
                extent: [1, 20, 1],
                cmd: val => view.reset(val),
            },
            shapeSize: {
                value: this.shapeSize,
                extent: [0.5, 5, 0.5],
                cmd: val => (this.shapeSize = val),
            },
            run: { value: () => animator.toggle() },
            // useMouse: { value: true, cmd: val => mouse.run(val) },
            // useSprites: {
            //     value: view.useSprites,
            //     cmd: val => (view.useSprites = val),
            // },
            // population: {
            //     value: model.population,
            //     extent: [5, 1000, 5],
            //     cmd: val => (model.population = val),
            // },
            perf: { value: 0, cmd: 'listen' },
        }
        // console.log(template)
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
