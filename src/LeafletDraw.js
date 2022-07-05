import * as util from './utils.js'
import TwoDraw from './TwoDraw.js'

import leafletInit from '../gis/leafletInit.js'

class LeafletDraw extends TwoDraw {
    constructor(model, viewOptions = {}, drawOptions = {}) {
        if (!model.world.bbox)
            throw Error('LeafletDraw: model must use GeoWorld')

        drawOptions = viewOptions.drawOptions || drawOptions
        if (!drawOptions.patchesColor) {
            drawOptions.patchesColor = 'transparent'
        }
        if (!viewOptions.div) {
            viewOptions.div = util.createCanvas(0, 0) // the view will resize
        }

        super(model, viewOptions, drawOptions)
    }

    async leafletInit(options = {}) {
        const params = await leafletInit(this.model, this.canvas, options)
        return params
    }
}

export default LeafletDraw
