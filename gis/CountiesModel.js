import * as turf from 'https://cdn.skypack.dev/@turf/turf'
import * as util from '../src/utils.js'
import GeoWorld from '../src/GeoWorld.js'
import HelloModel from '../models/HelloModel.js'

export default class CountiesModel extends HelloModel {
    constructor(counties) {
        const bbox = turf.bbox(counties)
        const world = new GeoWorld(bbox, 100)
        super(world)
        this.counties = counties
    }
    setup() {
        super.setup()
        this.patches.ask(p => {
            const pt = this.world.toGeo(p.x, p.y)
            util.forLoop(this.counties.features, (f, i) => {
                if (turf.booleanPointInPolygon(pt, f)) {
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
                // const name = t.feature
                //     ? t.feature.properties.NAME
                //     : 'No Where'
                // const population = t.feature
                //     ? t.feature.properties.population
                //     : 0
                // console.log(
                //     'new feature: turtle: ' + t.id + ',',
                //     'county: ' + name + ',',
                //     'population: ' + population
                // )
            }
        })
    }
}
