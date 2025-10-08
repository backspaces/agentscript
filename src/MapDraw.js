import * as util from '/src/utils.js'
import TwoDraw from '/src/TwoDraw.js'

// make sure world is a geoworld
// separate drawoptions from viewoptions if needed
// default patch colors to transparent
// default div to a canvas

class MapDraw extends TwoDraw {
    constructor(model, viewOptions = {}, drawOptions = {}) {
        if (!model.world.bbox) throw Error('MapDraw: model must use GeoWorld')

        drawOptions = TwoDraw.separateDrawOptions(viewOptions, drawOptions)

        if (!drawOptions.patchesColor) {
            drawOptions.patchesColor = 'transparent'
        }
        if (!viewOptions.div) {
            viewOptions.div = util.createCanvas(0, 0) // the view will resize
        }

        super(model, viewOptions, drawOptions)
    }
}

export default MapDraw
