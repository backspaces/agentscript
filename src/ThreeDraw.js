import util from '../src/util.js'
import ThreeView from '../src/ThreeView.js'
import ColorMap from '../src/ColorMap.js'

export default class ThreeDraw extends ThreeView {
    static defaultOptions() {
        return {
            patchColor: 'random',
            turtleColor: 'random',
            turtleShape: 'dart',
            turtleSize: 1,
            linkColor: 'random',
            linkWidth: 1,
            patchesMap: ColorMap.DarkGray,
            turtlesMap: ColorMap.Basic16,
            // textProperty: null,
            // textSize: 0.5,
            // textColor: 'black',
            initPatches: null,
        }
    }

    // ======================

    constructor(model, threeViewOptions = {}, drawOptions = {}) {
        super(model.world, threeViewOptions)
        this.model = model
        this.view = this
        this.drawOptions = drawOptions
    }

    // The parameters are easily mistaken: check they are all in the defaults.
    checkParams(params) {
        const keys = Object.keys(params)
        const defaults = ThreeDraw.defaultOptions()
        keys.forEach(k => {
            if (defaults[k] === undefined) {
                console.log(
                    'Legal ThreeDraw parameters',
                    Object.keys(ThreeDraw.defaultOptions())
                )
                throw Error('Unknown ThreeDraw parameter: ' + k)
            }
        })
    }

    // setup(fcn = (model, view) => {}) {
    //     // default to no-op
    //     // This used to be the initPatches() in drawOptions
    //     // supply the function with this.model, this.view as args
    //     fcn(this.model, this.view)
    // }

    // The simple default draw() function.
    // The params object overrides the default options.
    // randomTurtle(t) {return turtlesMap.atIndex(l.id).css}
    draw(params = this.drawOptions) {
        let {
            patchColor,
            turtleColor,
            turtleShape,
            turtleSize,
            linkColor,
            linkWidth,
            patchesMap,
            turtlesMap,
            // textProperty,
            // textSize,
            // textColor,
            initPatches,
        } = Object.assign({}, ThreeDraw.defaultOptions(), params)
        const { model, view } = this

        if (view.ticks === 0) {
            if (typeof turtlesMap === 'string')
                turtlesMap = params.turtlesMap = ColorMap[turtlesMap]
            if (typeof patchesMap === 'string')
                patchesMap = params.patchesMap = ColorMap[patchesMap]

            this.checkParams(params)

            // if (textProperty) view.setTextProperties(textSize)

            if (initPatches) {
                const colors = initPatches(model, view)
                view.createPatchPixels(i => colors[i].pixel)
            } else if (patchColor === 'random') {
                view.createPatchPixels(i => patchesMap.randomColor().pixel)
            }
        }

        if (patchColor === 'random' || patchColor === 'static' || initPatches) {
            // Already in gpu
            // view.drawPatches() // redraw cached patches colors below
        } else if (typeof patchColor === 'function') {
            view.drawPatches(model.patches, p => patchColor(p))
        } else if (util.isImageable(patchColor)) {
            view.drawPatchesImage(patchColor)
        } else {
            view.clear(patchColor)
        }

        const checkColor = (agent, color) =>
            color === 'random' ? turtlesMap.atIndex(agent.id).css : color

        view.drawLinks(model.links, l => ({
            color:
                linkColor === 'random'
                    ? turtlesMap.atIndex(l.id).css
                    : typeof linkColor === 'function'
                    ? checkColor(l, linkColor(t))
                    : linkColor,
            width: linkWidth,
        }))

        view.drawTurtles(model.turtles, t => ({
            shape:
                typeof turtleShape === 'function'
                    ? turtleShape(t)
                    : turtleShape,
            color:
                turtleColor === 'random'
                    ? turtlesMap.atIndex(t.id).css
                    : typeof turtleColor === 'function'
                    ? checkColor(t, turtleColor(t))
                    : turtleColor,
            size: typeof turtleSize === 'function' ? turtleSize(t) : turtleSize,
        }))

        // if (textProperty) {
        //     model.turtles.ask(t => {
        //         if (t[textProperty] != null)
        //             view.drawText(t[textProperty], t.x, t.y, textColor)
        //     })
        // }

        view.tick()
    }
}
