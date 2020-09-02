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

            turtlesColor: 'random',
            turtlesShape: 'dart',
            turtlesSize: 1,

            linksColor: 'random',
            linksWidth: 1,

            // patchesMap: ColorMap.DarkGray,
            // turtlesMap: ColorMap.Basic16,
            patchesMap: 'DarkGray',
            turtlesMap: 'Basic16',

            // textProperty: null,
            // textSize: 0.5,
            // textColor: 'black',

            initPatches: null,
        }
    }

    // ======================

    constructor(model, viewOptions = {}, drawOptions = {}) {
        // drawOptions = Object.assign({}, ThreeDraw.defaultOptions(), drawOptions)
        drawOptions = Object.assign(ThreeDraw.defaultOptions(), drawOptions)

        // Convert static colors to typedColor, works for all meshes.
        // TwoDraw simpler, doesn't (yet) need this.
        for (const color of ['patchesColor', 'turtlesColor', 'linksColor']) {
            if (isStaticColor(drawOptions[color])) {
                drawOptions[color] = Color.toTypedColor(drawOptions[color])
            }
        }

        // Convert viewOptions.patches from Patches to Points if shape == 'point'
        // REMIND: Currently just turtles can be points. Patches too?
        if (drawOptions.turtlesShape === 'point') {
            viewOptions.turtles = {
                meshClass: 'PointsMesh',
                options: { pointSize: drawOptions.turtlesSize }, // , z: 1.5
            }
            // If color static, set the mesh's color option, avoiding color buffer.
            if (isStaticColor(drawOptions.turtlesColor)) {
                viewOptions.turtles.options.color = drawOptions.turtlesColor
            }
        }
        const meshShapes = ['Dart3D', 'Cone', 'Cube', 'Cylinder', 'Sphere']
        if (meshShapes.includes(drawOptions.turtlesShape)) {
            viewOptions.turtles = {
                meshClass: 'Obj3DMesh',
                options: { pointSize: drawOptions.turtlesSize }, // , z: 1.5
            }
            // If color static, set the mesh's color option, avoiding color buffer.
            // if (isStaticColor(drawOptions.turtlesColor)) {
            //     viewOptions.turtles.options.color = drawOptions.turtlesColor
            // }
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
            patchesColor,
            initPatches,

            turtlesColor,
            turtlesShape,
            turtlesSize,

            linksColor,
            linksWidth,

            patchesMap,
            turtlesMap,

            // textProperty,
            // textSize,
            // textColor,
        } = this.drawOptions
        const { model, view } = this

        if (view.ticks === 0) {
            if (typeof turtlesMap === 'string')
                this.drawOptions.turtlesMap = turtlesMap = ColorMap[turtlesMap]
            if (typeof patchesMap === 'string')
                this.drawOptions.patchesMap = patchesMap = ColorMap[patchesMap]

            if (initPatches) {
                // colors is an array of typedColors or pixels:
                const colors = initPatches(model, view)
                view.createPatchPixels(i => colors[i])
            } else if (patchesColor === 'random') {
                // NOTE: random colors only done once for patches.
                view.createPatchPixels(i => patchesMap.randomColor())
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

        const checkColor = (agent, color) =>
            color === 'random' ? turtlesMap.atIndex(agent.id).css : color

        view.drawLinks(model.links, l => ({
            color:
                linksColor === 'random'
                    ? turtlesMap.atIndex(l.id)
                    : typeof linksColor === 'function'
                    ? checkColor(l, linksColor(t))
                    : linksColor,
            width: linksWidth,
        }))

        // REMIND: adjust for PointMesh
        view.drawTurtles(model.turtles, t => ({
            // shape ignored for 'point' shape
            shape:
                typeof turtlesShape === 'function'
                    ? turtlesShape(t)
                    : turtlesShape,
            // color ignored for static 'point' shape
            color:
                turtlesColor === 'random'
                    ? turtlesMap.atIndex(t.id)
                    : typeof turtlesColor === 'function'
                    ? checkColor(t, turtlesColor(t))
                    : turtlesColor,
            // size ignored for 'point' shape
            size:
                typeof turtlesSize === 'function'
                    ? turtlesSize(t)
                    : turtlesSize,
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
