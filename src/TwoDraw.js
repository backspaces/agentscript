import util from '../src/util.js'
import TwoView from '../src/TwoView.js'
import ColorMap from '../src/ColorMap.js'

// export default class TwoDraw {
export default class TwoDraw extends TwoView {
    static defaultOptions() {
        return {
            patchesColor: 'random',
            turtlesColor: 'random',
            turtleShape: 'dart',
            turtlesSize: 1,
            linksColor: 'random',
            linksWidth: 1,
            patchesMap: ColorMap.DarkGray,
            turtlesMap: ColorMap.Basic16,
            textProperty: null,
            textSize: 0.5,
            textColor: 'black',
            initPatches: null,
        }
    }

    // ======================

    constructor(model, twoViewOptions = {}, drawOptions = {}) {
        super(model.world, twoViewOptions)
        this.model = model
        this.view = this
        this.drawOptions = drawOptions
    }

    // The parameters are easily mistaken: check they are all in the defaults.
    checkParams(params) {
        const keys = Object.keys(params)
        const defaults = TwoDraw.defaultOptions()
        keys.forEach(k => {
            if (defaults[k] === undefined) {
                console.log(
                    'Legal TwoDraw parameters',
                    Object.keys(TwoDraw.defaultOptions())
                )
                throw Error('Unknown TwoDraw parameter: ' + k)
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
        // params = Object.assign({}, TwoDraw.defaultOptions(), params)
        let {
            patchesColor,
            turtlesColor,
            turtleShape,
            turtlesSize,
            linksColor,
            linksWidth,
            patchesMap,
            turtlesMap,
            textProperty,
            textSize,
            textColor,
            initPatches,
        } = Object.assign({}, TwoDraw.defaultOptions(), params)
        const { model, view } = this

        if (view.ticks === 0) {
            // REMIND: if moved to ctor, do this there?
            if (typeof turtlesMap === 'string')
                turtlesMap = params.turtlesMap = ColorMap[turtlesMap]
            if (typeof patchesMap === 'string')
                patchesMap = params.patchesMap = ColorMap[patchesMap]

            this.checkParams(params)

            if (textProperty) view.setTextProperties(textSize)

            if (initPatches) {
                const colors = initPatches(model, view)
                view.createPatchPixels(i => colors[i].pixel)
            } else if (patchesColor === 'random') {
                view.createPatchPixels(i => patchesMap.randomColor().pixel)
            }
        }

        // if (patchesColor === 'random' || patchesColor === 'static' || initPatches) {
        if (patchesColor === 'random' || initPatches) {
            view.drawPatches() // redraw cached patches colors below
        } else if (typeof patchesColor === 'function') {
            view.drawPatches(model.patches, p => patchesColor(p))
        } else if (util.isImageable(patchesColor)) {
            view.drawPatchesImage(patchesColor)
        } else {
            view.clear(patchesColor)
        }

        const checkColor = (agent, color) =>
            color === 'random' ? turtlesMap.atIndex(agent.id).css : color

        view.drawLinks(model.links, l => ({
            color:
                linksColor === 'random'
                    ? turtlesMap.atIndex(l.id).css
                    : typeof linksColor === 'function'
                    ? checkColor(l, linksColor(t))
                    : linksColor,
            width: linksWidth,
        }))

        view.drawTurtles(model.turtles, t => ({
            shape:
                typeof turtleShape === 'function'
                    ? turtleShape(t)
                    : turtleShape,
            color:
                turtlesColor === 'random'
                    ? turtlesMap.atIndex(t.id).css
                    : typeof turtlesColor === 'function'
                    ? checkColor(t, turtlesColor(t))
                    : turtlesColor,
            size:
                typeof turtlesSize === 'function'
                    ? turtlesSize(t)
                    : turtlesSize,
        }))

        if (textProperty) {
            model.turtles.ask(t => {
                if (t[textProperty] != null)
                    view.drawText(t[textProperty], t.x, t.y, textColor)
            })
        }

        view.tick()
    }
}
