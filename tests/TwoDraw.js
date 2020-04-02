import util from '../src/util.js'
import TwoView from '../src/TwoView.js'
import ColorMap from '../src/ColorMap.js'

export default class TwoDraw {
    static defaultOptions() {
        return {
            patchColor: undefined,
            turtleColor: undefined,
            linkColor: 'white', //'rgba(255,255,255,0.25',
            linkWidth: 1,
            shape: 'dart',
            shapeSize: 1,
            patchMap: ColorMap.DarkGray,
            turtleMap: ColorMap.Basic16,
        }
    }

    // ======================

    constructor(model, twoViewOptions = {}) {
        this.model = model
        this.view = new TwoView(model.world, twoViewOptions)
        // override defaults. feel free to add more params of your own
        // Object.assign(this, TwoDraw.defaultOptions(), drawOptions)
        this.view.createPatchPixels(i => ColorMap.DarkGray.randomColor().pixel)
    }

    draw(params = {}) {
        params = Object.assign({}, TwoDraw.defaultOptions(), params)
        const {
            patchColor,
            turtleColor,
            linkColor,
            linkWidth,
            shape,
            shapeSize,
            turtleMap,
        } = params
        const { model, view } = this

        if (typeof patchColor === 'undefined') {
            view.drawPatches() // redraw cached patches colors
        } else if (typeof patchColor === 'function') {
            view.drawPatches(model.patches, p => patchColor(p))
        } else if (util.isImageable(patchColor)) {
            view.drawPatchesImage(patchColor)
        } else {
            view.clear(patchColor)
        }

        view.drawLinks(model.links, { color: linkColor, width: linkWidth })

        view.drawTurtles(model.turtles, t => ({
            shape: shape,
            color:
                typeof turtleColor === 'undefined'
                    ? turtleMap.atIndex(t.id).css
                    : typeof turtleColor === 'function'
                    ? turtleColor(t)
                    : turtleColor,
            size: shapeSize,
        }))
    }
}
