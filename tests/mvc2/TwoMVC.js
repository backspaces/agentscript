// Attempt to make the refactoring of AgentScript into many
// parts easier for the modeler.

import TwoView from '../src/TwoView.js'
import ColorMap from '../src/ColorMap.js'
import Animator from '../src/Animator.js'
import GUI from '../src/GUI.js'
import Mouse from '../src/Mouse.js'
import Plot from '../src/Plot.js'
import util from '../src/util.js'

export default class TwoMVC {
    static defaultOptions() {
        return {
            // undefined => use model's default world
            worldOptions: undefined,

            // override any of this models options
            modelOptions: {
                // population: 1000 .. a common override
            },
            // override any of the view options:
            viewOptions: {
                // div: document.body,
                // plotCanvas: 'plotCanvas',
                // useSprites: false,
                // patchSize: 10,
            },

            // The rest are "draw options", used by draw()
            defaultGrayMap: 'DarkGray',
            defaultColorMap: 'Basic16',
        }
    }

    // options *override* the defaults above. Just put in ones that differ.
    constructor(modelClass, options, viewOptions = {}) {
        options = Object.assign(TwoMVC.defaultOptions(), options)

        this.model = new modelClass(options.worldOptions)
        Object.assign(this.model, options.modelOptions)

        Object.assign(options.viewOptions, viewOptions)
        this.view = new TwoView(this.model.world, options.viewOptions)

        this.animator = new Animator(this)

        this.mouse = new Mouse(this.view.canvas, this.model.world, mouse =>
            this.handleMouse(mouse)
        ).start()

        delete options.worldOptions
        delete options.modelOptions
        delete options.viewOptions
        Object.assign(this, options)

        this.defaultGrayMap = ColorMap[this.defaultGrayMap]
        this.defaultColorMap = ColorMap[this.defaultColorMap]
    }

    // MVC methods
    reset() {
        this.model.reset()
        this.plot.reset()
        this.animator.reset()
        this.view.clear('lightGray')
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
        util.warn('No draw() method, using TwoMVC defaultDraw()')
        this.defaultDraw()
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

    // dat.gui methods
    setGUI(template) {
        return new GUI(template).target
    }

    // plot methods
    setPlot(pens) {
        this.plot = new Plot(this.view.plotCanvas, pens)
    }
    // addPlotPoints(plot, points) {
    //     this.plot.addPoints(points)
    // }

    handleMouse(mouse) {
        util.warn('no mouse handler')
    }

    // ======================

    // A paramitized NL default draw
    defaultDraw(params = {}) {
        const defaults = {
            patchesColor: undefined,
            turtlesColor: undefined,
            linksColor: 'rgba(255,255,255,0.25',
            linksWidth: 1,
            shape: 'dart',
            shapeSize: 1,
        }
        params = Object.assign({}, defaults, params)
        const {
            patchesColor,
            turtlesColor,
            linksColor,
            linksWidth,
            shape,
            shapeSize,
        } = params
        const { model, view, animator } = this

        // Just draw patches once, results cached in view.patchesView
        if (animator.draws === 0 && !patchesColor) {
            view.createPatchPixels(i => this.defaultGrayMap.randomColor().pixel)
        }

        if (typeof patchesColor === 'undefined') {
            view.drawPatches() // redraw cached patches colors
        } else if (typeof patchesColor === 'function') {
            view.drawPatches(model.patches, p => patchesColor(p))
        } else if (util.isImageable(patchesColor)) {
            view.drawPatchesImage(patchesColor)
        } else {
            view.clear(patchesColor)
        }

        view.drawLinks(model.links, { color: linksColor, width: linksWidth })

        view.drawTurtles(model.turtles, t => ({
            shape: shape,
            color:
                typeof turtlesColor === 'undefined'
                    ? this.defaultColorMap.atIndex(t.id).css
                    : typeof turtlesColor === 'function'
                    ? turtlesColor(t)
                    : turtlesColor,
            size: shapeSize,
        }))
    }
}
