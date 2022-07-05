var gis = AS.gis
var World = AS.World
var Model = AS.Model
import { lineStringsToLinks } from '../src/geojson.js'

// This model is "static", in that step is a no-op.
// The json data is pre-computed due to being very difficult to compute here.
// Thus done offline via node/deno cli's
const xyz = [3370, 6451, 14]
const bbox = gis.xyz2bbox(...xyz)
const jsonUrl = '../models/data/santafe14roads.json'

console.log(bbox.toString())

class RoadsModel extends Model {
    constructor(worldOptions = World.defaultOptions(100)) {
        super(worldOptions)
    }

    async startup() {
        this.geojson = await fetch(jsonUrl).then(resp => resp.json())
    }

    setup() {
        this.turtleBreeds('intersections')
        this.turtles.setDefault('atEdge', 'OK')
        this.network = lineStringsToLinks(this, bbox, this.geojson)
        this.turtles.ask(t => {
            if (t.links.length > 2) this.intersections.setBreed(t)
        })
    }
    step() {
        // static for now
    }
}
const defaultModel = RoadsModel

