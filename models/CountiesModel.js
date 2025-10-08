import * as util from '/src/utils.js'
import HelloModel from '/models/HelloModel.js'
import { booleanPointInPolygon } from '/vendor/turfImports.js'
import counties from './data/nmcounties.json' with { type: 'json' }

class CountiesModel extends HelloModel {
    linksToo = false // don't include links between turtles

    // Note these options cause HelloModel => Model to use GeoWorld
    static defaultOptions() {
        return { bbox: counties, patchesWidth: 100 }
    }

    constructor(options = CountiesModel.defaultOptions()) {
        super(options)
    }
    setup() {
        super.setup()
        this.patches.ask(p => {
            const pt = this.world.toGeo(p.x, p.y)
            // note: the geoworld has to be constructed with geojson for bbox
            util.forLoop(this.world.geojson.features, f => {
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

export default CountiesModel

