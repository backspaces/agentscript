import Model from '../models/VirusModel.js'
import TwoMVC from './TwoMVC.js'
import util from '../src/util.js'

export default class VirusMVC extends TwoMVC {
    static defaultOptions() {
        return {
            modelOptions: {
                population: 1000,
            },

            viewOptions: {
                patchSize: 8,
            },

            // View parameters, used by draw() below
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
        super(Model, VirusMVC.defaultOptions(), viewOverrides)
        this.gui = this.setGUI()
        const template = {}
        util.forLoop(
            this.turtleColors,
            (val, key) => (template[key] = { color: val })
        )
        this.plot = super.setPlot(template)
    }

    draw() {
        // Draw the model world view w defaultDraw w/ our params
        // view.clear('black')
        // view.drawLinks(model.links, { color: 'white', width: 1 })
        // view.drawTurtles(model.turtles, t => ({
        //     shape: this.shape,
        //     color: this.turtleColors[t.state],
        //     size: this.shapeSize,
        // }))

        super.defaultDraw({
            patchColor: 'black',
            turtleColor: t => this.turtleColors[t.state],
            shape: this.shape,
            shapeSize: this.shapeSize,
            linkColor: 'white',
        })

        // Draw data to the gui:
        this.gui.perf = animator.ticksPerSec()

        // Update plot
        if (this.animator.ticks % 10 === 0) {
            const turtles = this.model.turtles
            this.plot.addPoints({
                infected: turtles.with(t => t.state === 'infected').length,
                susceptible: turtles.with(t => t.state === 'susceptible')
                    .length,
                resistant: turtles.with(t => t.state === 'resistant').length,
            })
        }
    }

    step() {
        super.step()
        if (this.model.done) this.animator.stop()
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
