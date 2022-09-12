import * as util from '../src/utils.js'
import TwoDraw from '../src/TwoDraw.js'

// import leafletInit from './leafletInit.js'

class MapDraw extends TwoDraw {
    constructor(model, viewOptions = {}, drawOptions = {}) {
        if (!model.world.bbox)
            throw Error('LeafletDraw: model must use GeoWorld')

        drawOptions = viewOptions.drawOptions || drawOptions
        if (viewOptions.drawOptions) delete viewOptions.drawOptions

        drawOptions.patchesColor = drawOptions.patchesColor || 'transparent'
        viewOptions.div = viewOptions.div || util.createCanvas(0, 0)

        // if (!drawOptions.patchesColor) {
        //     drawOptions.patchesColor = 'transparent'
        // }
        // if (!viewOptions.div) {
        //     viewOptions.div = util.createCanvas(0, 0) // the view will resize
        // }

        super(model, viewOptions, drawOptions)
    }

    // async leafletInit(options = {}) {
    //     const params = await leafletInit(this.model, this.canvas, options)
    //     return params
    // }
}

export default MapDraw
