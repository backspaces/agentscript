import * as gis from '../src/gis.js'
import World from '../src/World.js'
import Model from '../src/Model.js'
import util from '../src/util.js'
// import AgentArray from '../src/AgentArray.js'

export default class RoadsModel extends Model {
    static defaultOptions() {
        const { Z, X, Y } = { Z: 14, X: 3370, Y: 6451 }
        return {
            zxy: { Z, X, Y },
            // jsonUrl: `https://backspaces.github.io/agentscript/models/roads${Z}vt.json`,
            jsonUrl: `./roads${Z}vt.json`,
        }
    }

    // ======================

    constructor(worldDptions = World.defaultOptions(100)) {
        super(worldDptions)
        Object.assign(this, RoadsModel.defaultOptions())
        this.nodeCache = {}
        // this.trips = []
    }

    async startup() {
        // const json = await util.xhrPromise(this.jsonUrl)
        // this.geojson = JSON.parse(json)
        this.geojson = await util.xhrPromise(this.jsonUrl, 'json')
    }

    getNode(pt) {
        const key = pt.toString()
        let node = this.nodeCache[key]
        if (node) return node

        node = this.turtles.createOne(t => {
            t.setxy(...this.xfm.toWorld(pt))
            t.lon = pt[0]
            t.lat = pt[1]
        })
        this.nodeCache[key] = node
        return node
    }
    newLink(pt0, pt1) {
        const t0 = this.getNode(pt0)
        const t1 = this.getNode(pt1)
        return this.links.createOne(t0, t1)
    }
    lineStringToLinks(lineString) {
        // const lineLinks =
        lineString.reduce((acc, pt, i, a) => {
            // const link = [a[i - 1], pt]
            const link = this.newLink(a[i - 1], pt)
            if (i === 1) {
                acc = [link]
                acc.properties = lineString.properties
            } else {
                acc.push(link)
            }
            link.lineString = acc
            return acc
        })
        // lineLinks.forEach(link => link.)
    }
    setup() {
        this.turtleBreeds('intersections')
        // this.linkBreeds('trips')
        this.turtles.setDefault('atEdge', 'OK')

        const { Z, X, Y } = this.zxy
        const bbox = gis.xy2bbox(X, Y, Z)
        console.log('bbox', bbox.toString())
        const [west, south, east, north] = bbox

        this.xfm = this.world.bboxTransform(...bbox)
        console.log(
            'bbox diagonal size',
            gis.lonLat2meters([west, south], [east, north])
        )

        const features = this.geojson.features
        // note index is shared amongst the MultiLineStrings
        features.forEach((obj, i) => {
            obj.properties.featureIndex = i
            obj.properties.featureID = obj.id
        })

        this.lineStrings = features.reduce((acc, obj, i) => {
            const geom = obj.geometry
            if (geom.type === 'LineString') {
                geom.coordinates.properties = obj.properties
                acc.push(geom.coordinates)
            } else if (geom.type === 'MultiLineString') {
                geom.coordinates.forEach(a => {
                    a.properties = obj.properties
                    acc.push(a)
                })
            }
            return acc
        }, [])

        this.lineStrings.forEach(lineString =>
            this.lineStringToLinks(lineString)
        )

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
