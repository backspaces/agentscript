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

    constructor(model, viewOptions = {}, drawOptions = {}) {
        drawOptions = Object.assign({}, ThreeDraw.defaultOptions(), drawOptions)
        if (drawOptions.turtleShape === 'point') {
            viewOptions.turtles = {
                meshClass: 'PointsMesh',
                options: { pointSize: drawOptions.turtleSize, z: 1.5 },
            }
            // if(typeof drawOptions.turtleColor !== 'function' )
            if (Array.isArray(drawOptions.turtleColor)) {
                viewOptions.turtles.color = drawOptions.turtleColor
            }
        }

        super(model.world, viewOptions)

        this.model = model
        this.view = this
        this.checkParams(drawOptions)
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

    draw() {
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
        } = this.drawOptions
        const { model, view } = this

        if (view.ticks === 0) {
            if (initPatches) {
                const colors = initPatches(model, view)
                view.createPatchPixels(i => colors[i].pixel)
            } else if (patchColor === 'random') {
                view.createPatchPixels(i => patchesMap.randomColor().pixel)
            }
        }

        let lastImage, lastClearColor
        // if (patchColor === 'random' || patchColor === 'static' || initPatches) {
        if (patchColor === 'random' || initPatches) {
            // Already in gpu
            // view.drawPatches() // redraw cached patches colors below
        } else if (typeof patchColor === 'function') {
            view.drawPatches(model.patches, p => patchColor(p))
        } else if (util.isImageable(patchColor)) {
            // Already in gpu?
            if (patchColor !== lastImage) {
                view.drawPatchesImage(patchColor)
                lastImage = patchColor
            }
        } else {
            if (patchColor !== lastClearColor) {
                view.clearPatches(patchColor)
                lastClearColor = patchColor
            }
        }

        // Return a cmap color if "random", or the color unchanged
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

        const turtleClass = view.options.turtles.meshClass
        view.drawTurtles(model.turtles, t => ({
            // ignored for 'point' shape
            shape:
                typeof turtleShape === 'function'
                    ? turtleShape(t)
                    : turtleShape,
            color:
                turtleColor === 'random'
                    ? turtleClass === 'QuadSpritesMesh'
                        ? turtlesMap.atIndex(t.id).css
                        : turtlesMap.atIndex(t.id).webgl
                    : typeof turtleColor === 'function'
                    ? checkColor(t, turtleColor(t))
                    : turtleColor,
            // ignored for 'point' shape
            size: typeof turtleSize === 'function' ? turtleSize(t) : turtleSize,
        }))

        // if (textProperty) {
        //     model.turtles.ask(t => {
        //         if (t[textProperty] != null)
        //             view.drawText(t[textProperty], t.x, t.y, textColor)
        //     })
        // }

        view.render() // calls three.render() & view.tick()
    }
}
