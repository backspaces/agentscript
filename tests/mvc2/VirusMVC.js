import Model from '../models/VirusModel.js'
import TwoMVC from './TwoMVC.js'
import util from '../src/util.js'

export default class VirusMVC extends TwoMVC {
    static defaultOptions() {
        return {
            modelOptions: {
                population: 250, //1000,
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
        super.setPlot(this.turtleColors)
    }

    draw() {
        super.defaultDraw({
            patchesColor: 'black',
            turtlesColor: t => this.turtleColors[t.state],
            shape: this.shape,
            shapeSize: this.shapeSize,
            linksColor: 'white',
        })

        // Draw data to the gui:
        this.gui.perf = animator.ticksPerSec()
        this.gui.ticks = animator.ticks

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
            population: {
                value: model.population,
                extent: [50, 1000, 50],
                cmd: val => {
                    this.reset()
                    model.population = val
                },
            },
            nodeDegree: {
                value: model.averageNodeDegree,
                extent: [1, 20],
                cmd: val => {
                    this.reset()
                    model.averageNodeDegree = val
                },
            },
            outbreakSize: {
                value: model.outbreakSize,
                extent: [1, 20],
                cmd: val => {
                    this.reset()
                    model.outbreakSize = val
                },
            },
            setup: {
                value: () => {
                    this.reset()
                    model.setup()
                    animator.start()
                },
            },
            // virusSpreadPercent: 2.5,
            // virusCheckFrequency: 1,
            // recoveryPercent: 5.0,
            // gainResistancePercent: 5.0,
            spreadPercent: {
                value: model.virusSpreadPercent,
                extent: [0, 10, 0.1],
                cmd: val => (model.virusSpreadPercent = val),
            },
            checkFrequency: {
                value: model.virusCheckFrequency,
                extent: [1, 20, 1],
                cmd: val => (model.virusCheckFrequency = val),
            },
            recoveryPercent: {
                value: model.recoveryPercent,
                extent: [0, 10, 0.1],
                cmd: val => (model.recoveryPercent = val),
            },
            resistancePercent: {
                value: model.gainResistancePercent,
                extent: [0, 100, 1],
                cmd: val => (model.gainResistancePercent = val),
            },

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
            pause: { value: () => animator.toggle() },
            // useMouse: { value: true, cmd: val => mouse.run(val) },
            // useSprites: {
            //     value: view.useSprites,
            //     cmd: val => (view.useSprites = val),
            // },
            ticks: { value: 0, cmd: 'listen' },
            perf: { value: 0, cmd: 'listen' },
        }
        // console.log(template)
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
