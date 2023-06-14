import * as util from '../src/utils.js'
import HelloModel from './HelloModel.js'
import { booleanPointInPolygon } from '../vendor/turfImports.js'

const url = import.meta.resolve('./data/nmcounties.json')
const counties = await fetch(url).then(resp => resp.json())
console.log('counties: url', url, 'counties', counties.features.length)

class CountiesModel extends HelloModel {
    static defaultOptions() {
        console.log('counties: defaultOptions called')
        return { bbox: counties, patchesWidth: 100 }
    }

    constructor(options = CountiesModel.defaultOptions()) {
        console.log('counties: ctor options', Object.keys(options))
        super(options)
    }
    setup() {
        console.log('counties: setup')

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

// const counties = await fetch('../models/data/nmcounties.json').then(resp =>
//     resp.json()
// )
