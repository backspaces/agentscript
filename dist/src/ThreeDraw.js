import util from '../src/util.js'
import ThreeView from '../src/ThreeView.js'
import ColorMap from '../src/ColorMap.js'
import Color from './Color.js'

function isStaticColor(color) {
    return !isDynamicColor(color)
}
function isDynamicColor(color) {
    return (
        color === 'random' || util.isImageable(color) || util.isFunction(color)
    )
}
// function meshColorType(mesh) {
//     return mesh.options.colorType
// }
// function meshColor(color, mesh) {
//     const type = mesh.options.colorType
//     if (Color.isTypedColor() || Color.colorType(color) === type) return color
//     return Color.toTypedColor(color)
// }

export default class ThreeDraw extends ThreeView {
    static defaultOptions() {
        return {
            patchesColor: 'random',

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

        // Convert static colors to typedColor, works for all meshes.
        for (const color of ['patchesColor', 'turtleColor', 'linkColor']) {
            if (isStaticColor(drawOptions[color])) {
                drawOptions[color] = Color.toTypedColor(drawOptions[color])
            }
        }

        // Convert viewOptions.patches from Patches to Points if shape == 'point'
        // REMIND: Currently just turtles can be points. Patches too?
        if (drawOptions.turtleShape === 'point') {
            viewOptions.turtles = {
                meshClass: 'PointsMesh',
                options: { pointSize: drawOptions.turtleSize }, // , z: 1.5
            }
            // If color static, set the mesh's color option, avoiding color buffer.
            if (isStaticColor(drawOptions.turtleColor)) {
                viewOptions.turtles.options.color = drawOptions.turtleColor
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
    // colorType(agentSetName) {
    //     return this.meshes[agentSetName].options.colorType
    // }

    draw() {
        // Return a cmap color if "random", or the color as is.
        // Note this checks the return of color fcn, not whether the
        // color was 'random' initally. Fcn can also return 'random'
        const checkFcnColor = (agent, color, map = turtlesMap) =>
            color === 'random' ? map.atIndex(agent.id) : color

        let {
            patchesColor,
            initPatches,

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
        } = this.drawOptions
        const { model, view } = this

        if (view.ticks === 0) {
            if (initPatches) {
                // REMIND: If Points allowed, need webgl color type.
                //   should check mesh.options.colorType
                const colors = initPatches(model, view)
                // colors is an array of typedColors or pixels:
                view.createPatchPixels(i => colors[i].pixel || colors[i])
            } else if (patchesColor === 'random') {
                // NOTE: random colors only done once for patches.
                view.createPatchPixels(i => patchesMap.randomColor().pixel)
            }
        }

        let lastImage, lastClearColor
        if (patchesColor === 'random' || initPatches) {
            // Already in gpu
        } else if (typeof patchesColor === 'function') {
            view.drawPatches(model.patches, p => patchesColor(p))
        } else if (util.isImageable(patchesColor)) {
            // Already in gpu?
            if (patchesColor !== lastImage) {
                view.drawPatchesImage(patchesColor)
                lastImage = patchesColor
            }
        } else {
            // Should be static color for clear() call
            // Already in gpu?
            if (patchesColor !== lastClearColor) {
                view.clearPatches(patchesColor)
                lastClearColor = patchesColor
            }
        }

        view.drawLinks(model.links, l => ({
            color:
                linkColor === 'random'
                    ? turtlesMap.atIndex(l.id)
                    : typeof linkColor === 'function'
                    ? checkFcnColor(l, linkColor(t))
                    : linkColor,
            width: linkWidth,
        }))

        // REMIND: adjust for PointMesh
        view.drawTurtles(model.turtles, t => ({
            // shape ignored for 'point' shape
            shape:
                typeof turtleShape === 'function'
                    ? turtleShape(t)
                    : turtleShape,
            // color ignored for static 'point' shape
            color:
                turtleColor === 'random'
                    ? turtlesMap.atIndex(t.id)
                    : typeof turtleColor === 'function'
                    ? checkFcnColor(t, turtleColor(t))
                    : turtleColor,
            // size ignored for 'point' shape
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
