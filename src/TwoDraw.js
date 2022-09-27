import * as util from './utils.js'
import TwoView from '../src/TwoView.js'
import ColorMap from '../src/ColorMap.js'

/**
 * Basic 2D view.
 *
 * **TODO: Document this class**
 */
class TwoDraw extends TwoView {
    static defaultOptions(model) {
        return {
            // data: {},

            patchesColor: 'random',
            initPatches: null,

            turtles: model.turtles,
            turtlesColor: 'random',
            turtlesStrokeColor: 'random',
            turtlesShape: 'dart',
            turtlesSize: 1,
            turtlesRotate: true,

            links: model.links,
            linksColor: 'random',
            linksWidth: 1,

            textProperty: null,
            textSize: 0.5,
            textColor: 'black',

            patchesMap: 'DarkGray',
            turtlesMap: 'Basic16',
        }
    }
    static separateDrawOptions(viewOptions, drawOptions) {
        if (viewOptions.drawOptions) {
            // drawOptions = viewOptions.drawOptions
            Object.assign(drawOptions, viewOptions.drawOptions)
            delete viewOptions.drawOptions
        }
        return drawOptions
        // return [viewOptions, drawOptions]
    }

    // ======================

    constructor(model, viewOptions = {}, drawOptions = {}) {
        // if (viewOptions.drawOptions) {
        //     drawOptions = viewOptions.drawOptions
        //     delete viewOptions.drawOptions
        // }

        // ;[viewOptions, drawOptions] =
        drawOptions = TwoDraw.separateDrawOptions(viewOptions, drawOptions)

        drawOptions = Object.assign(
            // {},
            TwoDraw.defaultOptions(model),
            drawOptions
        )

        // super(model.world, viewOptions) // TwoView
        super(model, viewOptions) // TwoView
        this.model = model

        this.checkOptions(drawOptions)
        this.drawOptions = drawOptions
        // this.view = this
        // this.checkOptions(drawOptions)
        // this.drawOptions = drawOptions
    }

    // The parameters are easily mistaken: check they are all in the defaults.
    checkOptions(drawOptions) {
        const keys = Object.keys(drawOptions)
        const defaults = TwoDraw.defaultOptions(this.model)

        keys.forEach(k => {
            if (defaults[k] === undefined) {
                console.log(
                    'Legal TwoDraw parameters',
                    Object.keys(TwoDraw.defaultOptions(this.model))
                )
                throw Error('Unknown TwoDraw parameter: ' + k)
            }
        })

        if (typeof drawOptions.patchesMap === 'string') {
            drawOptions.patchesMap = ColorMap[drawOptions.patchesMap]
            if (!drawOptions.patchesMap)
                Error('Unknown patchMap: ' + drawOptions.patchesMap)
        }
        if (typeof drawOptions.turtlesMap === 'string') {
            drawOptions.turtlesMap = ColorMap[drawOptions.turtlesMap]
            if (!drawOptions.turtlesMap)
                Error('Unknown turtlesMap: ' + drawOptions.turtlesMap)
        }
    }

    resetOptions(drawOptions = this.drawOptions) {
        // if (drawOptions !== this.drawOptions)
        //     drawOptions = Object.assign(
        //         {},
        //         TwoDraw.defaultOptions(),
        //         drawOptions
        //     )
        // drawOptions = Object.assign({}, TwoDraw.defaultOptions(), drawOptions)
        this.checkOptions(drawOptions)
        this.drawOptions = drawOptions
        this.ticks = 0
        // this.view.ticks = 0
        return drawOptions
    }

    draw() {
        // params = Object.assign({}, TwoDraw.defaultOptions(), params)
        const model = this.model
        const view = this
        let {
            // data,
            patchesColor,
            initPatches,

            turtles,
            turtlesColor,
            turtlesStrokeColor,
            turtlesShape,
            turtlesSize,
            turtlesRotate,

            links,
            linksColor,
            linksWidth,

            textProperty,
            textSize,
            textColor,

            patchesMap,
            turtlesMap,
        } = this.drawOptions
        // const { model, view } = this

        if (view.ticks === 0) {
            if (textProperty) view.setTextProperties(textSize)

            if (initPatches) {
                // colors is an array of typedColors or pixels:
                const colors = initPatches(model, view)
                view.createPatchPixels(i => colors[i])
                // console.log(colors)
            } else if (patchesColor === 'random') {
                // NOTE: random colors only done once for patches.
                view.createPatchPixels(i => patchesMap.randomColor())
            }
        }

        // view.clear()

        if (patchesColor === 'random' || initPatches) {
            view.clear() // patch transparent pixels do not clear the canvas!
            view.drawPatches() // redraw cached patches colors onto our view canvas
        } else if (typeof patchesColor === 'function') {
            view.drawPatches(model.patches, p => patchesColor(p))
        } else if (util.isImageable(patchesColor)) {
            view.drawPatchesImage(patchesColor)
        } else {
            view.clear(patchesColor)
        }

        const checkColor = (agent, color) =>
            color === 'random' ? turtlesMap.atIndex(agent.id).css : color

        view.drawLinks(links, l => ({
            color:
                linksColor === 'random'
                    ? turtlesMap.atIndex(l.id)
                    : typeof linksColor === 'function'
                    ? checkColor(l, linksColor(l))
                    : linksColor,
            width: linksWidth,
        }))

        view.drawTurtles(turtles, t => ({
            shape:
                typeof turtlesShape === 'function'
                    ? turtlesShape(t)
                    : turtlesShape,
            color:
                turtlesColor === 'random'
                    ? turtlesMap.atIndex(t.id).css
                    : typeof turtlesColor === 'function'
                    ? checkColor(t, turtlesColor(t))
                    : turtlesColor,
            strokeColor:
                turtlesStrokeColor === 'random'
                    ? turtlesMap.atIndex(t.id + 4).css
                    : typeof turtlesColor === 'function'
                    ? checkColor(t, turtlesColor(t))
                    : turtlesColor,
            size:
                typeof turtlesSize === 'function'
                    ? turtlesSize(t)
                    : turtlesSize,
            noRotate:
                typeof turtlesRotate === 'function'
                    ? !turtlesRotate(t)
                    : !turtlesRotate,
        }))

        if (textProperty) {
            turtles.ask(t => {
                if (t[textProperty] != null)
                    view.drawText(t[textProperty], t.x, t.y, textColor)
            })
        }

        view.tick()
    }
}

export default TwoDraw
