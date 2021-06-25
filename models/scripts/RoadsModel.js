var gis = AS.gis
var World = AS.World
var Model = AS.Model
var geojson = AS.geojson

// This model is "static", in that these cannot be dynamic.
// This is due to the json data being very difficult to compute
// thus done off=line via node/deno
const zxy = { Z: 14, X: 3370, Y: 6451 }
const bbox = gis.xyz2bbox(zxy.X, zxy.Y, zxy.Z)
// const jsonUrl = '../models/data/roads14vt.json'
const jsonUrl = '../models/data/santafe14roads.json'
// const jsonUrl = '../models/data/santafe14roads0.json'

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
        geojson.lineStringsToLinks(this, bbox, this.geojson)
        this.turtles.ask(t => {
            if (t.links.length > 2) this.intersections.setBreed(t)
        })
    }
    step() {
        // static for now
    }
}
const defaultModel = RoadsModel

