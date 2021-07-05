import * as gis from '../src/gis.js'
import World from '../src/World.js'
import Model from '../src/Model.js'
import { lineStringsToLinks } from '../src/geojson.js'

// This model is "static", in that these cannot be dynamic.
// This is due to the json data being very difficult to compute
// thus done off=line via node/deno
const xyz = [3370, 6451, 14]
const bbox = gis.xyz2bbox(...xyz)
const jsonUrl = '../models/data/santafe14roads.json'

console.log(bbox.toString())

export default class RoadsModel extends Model {
    constructor(worldOptions = World.defaultOptions(100)) {
        super(worldOptions)
    }

    async startup() {
        this.geojson = await fetch(jsonUrl).then(resp => resp.json())
    }

    setup() {
        this.turtleBreeds('intersections')
        this.turtles.setDefault('atEdge', 'OK')
        lineStringsToLinks(this, bbox, this.geojson)
        this.turtles.ask(t => {
            if (t.links.length > 2) this.intersections.setBreed(t)
        })
    }
    step() {
        // static for now
    }
}
