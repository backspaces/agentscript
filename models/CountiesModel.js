import * as util from 'https://code.agentscript.org/src/utils.js'
import HelloModel from 'https://code.agentscript.org/models/HelloModel.js'
import { booleanPointInPolygon } from '../vendor/turfImports.js'
import counties from './data/nmcounties.json' with { type: 'json' }

// const url = import.meta.resolve('./data/nmcounties.json')
// const counties = await fetch(url).then(resp => resp.json())
// console.log('counties: url', url, 'counties', counties.features.length)

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

