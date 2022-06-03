import * as util from './utils.js'
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

/**
 * Basic 3D view.
 *
 * **TODO: Document this class**
 */
class ThreeDraw extends ThreeView {
    static defaultOptions() {
        return {
            patchesMesh: null, // 'PatchesMesh',
            turtlesMesh: null, // 'QuadSpritesMesh',
            linksMesh: null, // 'LinksMesh',

            patchesColor: 'random',
            // patchesShape: 'point',
            // patchesShape: null,
            patchesSize: 1,
            initPatches: null,

            turtlesColor: 'random',
            turtlesShape: 'dart',
            turtlesSize: 1,

            linksColor: 'random',
            linksWidth: 1,

            patchesMap: 'DarkGray',
            turtlesMap: 'Basic16',

            // textProperty: null,
            // textSize: 0.5,
            // textColor: 'black',
        }
    }

    // ======================

    constructor(model, viewOptions = {}, drawOptions = {}) {
        // merge defaultOptions into drawOptions
        if (viewOptions.drawOptions) {
            drawOptions = viewOptions.drawOptions
            delete viewOptions.drawOptions
        }
        drawOptions = Object.assign(ThreeDraw.defaultOptions(), drawOptions)

        // Instantiate maps if only names given.
        if (typeof drawOptions.turtlesMap === 'string')
            drawOptions.turtlesMap = ColorMap[drawOptions.turtlesMap]
        if (typeof drawOptions.patchesMap === 'string')
            drawOptions.patchesMap = ColorMap[drawOptions.patchesMap]

        // filter out meshes object from View & viewOptions overrides
        const { patches, turtles, links } = Object.assign(
            ThreeView.defaultOptions(),
            viewOptions
        )
        const meshes = { patches, turtles, links }

        // Sync meshes to drawOptions.
        for (const mesh of ['patches', 'turtles', 'links']) {
            // Add draw meshes to view
            const meshName = mesh + 'Mesh'
            if (drawOptions[meshName]) {
                const option = drawOptions[meshName]
                meshes[mesh] =
                    typeof option === 'string' ? { meshClass: option } : option
            }

            // If color is static, convert to typedColor
            // & add to mesh for static static meshes & attributes
            const color = mesh + 'Color'
            if (isStaticColor(drawOptions[color])) {
                drawOptions[color] = Color.toTypedColor(drawOptions[color])
                meshes[mesh].color = drawOptions[color] // typed color
            }

            // Add static sizes to viewOptions for static meshes & attributes
            const size = mesh + 'Size'
            if (typeof drawOptions[size] === 'number') {
                // && mesh != 'patches'
                meshes[mesh].size = drawOptions[size]
            }
        }
        // console.log('meshes', meshes)

        // call View ctor, overriding mesh options derived above
        Object.assign(viewOptions, meshes)
        super(model.world, viewOptions)
        console.log('viewOptions', viewOptions)
        console.log('drawOptions', drawOptions)
        console.log('meshes', meshes)

        // Initialization for static patches:
        if (this.meshName('patches') === 'PatchesMesh') {
            if (drawOptions.initPatches) {
                // colors is an array of typedColors or pixels:
                const colors = drawOptions.initPatches(model, this) //view)
                this.createPatchPixels(i => colors[i])
            } else if (drawOptions.patchesColor === 'random') {
                // NOTE: random colors only done once for patches.
                this.createPatchPixels(i =>
                    drawOptions.patchesMap.randomColor()
                )
            }
        }

        // merge model, view, drawOptions into "this"
        this.checkParams(drawOptions)
        Object.assign(this, { model, view: this, drawOptions })
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
    getMesh(agentSet) {
        return this.meshes[agentSet]
    }
    meshName(agentSet) {
        return this.meshes[agentSet].name
    }

    draw() {
        let {
            patchesColor,
            patchesShape,
            patchesSize,
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

        // Helpers for converting color, shape, size below
        const getColor = (agent, color, map) =>
            color === 'random'
                ? map.atIndex(agent.id)
                : typeof color === 'function'
                ? checkColor(agent, color(agent))
                : color
        const getShape = (agent, shape) =>
            typeof shape === 'function' ? shape(agent) : shape
        const getSize = (agent, size) =>
            typeof size === 'function' ? size(agent) : size

        const checkColor = (agent, color, map = turtlesMap) =>
            color === 'random'
                ? map.atIndex(agent.id) //.css
                : Color.toTypedColor(color)

        let lastImage, lastClearColor
        if (this.meshName('patches') === 'PatchesMesh') {
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
        } else {
            view.drawPatches(model.patches, p => ({
                shape: getShape(p, patchesShape),
                color: getColor(p, patchesColor, patchesMap),
                size: getSize(p, patchesSize),
            }))
        }

        view.drawLinks(model.links, l => ({
            color: getColor(l, linksColor, turtlesMap),
            width: linksWidth,
        }))

        // REMIND: adjust for PointMesh
        view.drawTurtles(model.turtles, t => ({
            shape: getShape(t, turtlesShape),
            color: getColor(t, turtlesColor, turtlesMap),
            size: getSize(t, turtlesSize),
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

export default ThreeDraw
