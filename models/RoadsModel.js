import * as gis from '../src/gis.js'
import GeoWorld from '../src/GeoWorld.js'
import Model from '../src/Model.js'
import * as geojson from '../src/geojson.js'

// This model is "static", in that these cannot be dynamic.
// This is due to the json data being very difficult to compute
// thus done off=line via node/deno
const zxy = { Z: 14, X: 3370, Y: 6451 }
const bbox = gis.xy2bbox(zxy.X, zxy.Y, zxy.Z)
const jsonUrl = `../models/data/roads${zxy.Z}vt.json`

export default class RoadsModel extends Model {
    constructor(worldOptions = new GeoWorld(bbox, 200)) {
        super(worldOptions)
    }

    async startup() {
        this.geojson = await fetch(jsonUrl).then(resp => resp.json())
    }

    setup() {
        this.turtleBreeds('intersections')
        // this.linkBreeds('trips')
        this.turtles.setDefault('atEdge', 'OK')

        geojson.lineStringsToLinks(this, this.geojson)

        this.turtles.ask(t => {
            if (t.links.length > 2) this.intersections.setBreed(t)
        })
    }
    step() {
        // const int1 = this.intersections.oneOf()
        // let int2 = this.intersections.oneOf()
        // while (int1.distance(int2) < 10) int2 = this.intersections.oneOf()
        // const trip = this.trips.createOne(int1, int2, l => {
        //     l.date = new Date()
        // })
        // if (this.trips.length > 15) this.trips.otherOneOf(trip).die()
    }
}
