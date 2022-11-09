var util = AS.util
var HelloModel = AS.HelloModel
// import HelloModel from '../models/HelloModel.js'
// import GeoWorld from '../src/GeoWorld.js'
var booleanPointInPolygon = AS.booleanPointInPolygon

const counties = await fetch('../models/data/nmcounties.json').then(resp =>
    resp.json()
)

class CountiesModel extends HelloModel {
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
            util.forLoop(this.world.geojson.features, (f, i) => {
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

CountiesModel
const defaultModel = export

