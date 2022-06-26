import * as util from '../src/utils.js'
import HelloModel from '../models/HelloModel.js'
import booleanPointInPolygon from 'https://cdn.skypack.dev/@turf/boolean-point-in-polygon'

export default class CountiesModel extends HelloModel {
    // Constructor not needed, called with GeoWorld world object, passed to super
    setup() {
        super.setup()
        this.patches.ask(p => {
            const pt = this.world.toGeo(p.x, p.y)
            util.forLoop(this.world.geojson.features, (f, i) => {
                // if (turf.booleanPointInPolygon(pt, f)) {
                if (booleanPointInPolygon(pt, f)) {
                    if (p.feature) console.log('p.feature exists', p)
                    p.feature = f
                }
            })
        })
        this.turtles.ask(t => {
            t.feature = t.patch.feature
            t.county = null
        })
    }
    step() {
        super.step()
        this.turtles.ask(t => {
            if (t.feature !== t.patch.feature || !t.county) {
                t.feature = t.patch.feature
                t.county = t.feature ? Number(t.feature.properties.COUNTY) : 0
            }
        })
    }
}
