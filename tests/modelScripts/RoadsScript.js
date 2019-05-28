const util = AS.util
const gis = AS.gis
const Model = AS.Model

class RoadsModel extends Model {
    static defaults() {
        const { Z, X, Y } = { Z: 14, X: 3370, Y: 6451 }
        return {
            zxy: { Z, X, Y },
            jsonUrl: `https://backspaces.github.io/agentscript/models/roads${Z}vt.json`,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions)
        Object.assign(this, RoadsModel.defaults())
        this.nodeCache = {}
    }

    async startup() {
        const json = await util.xhrPromise(this.jsonUrl)
        this.geojson = JSON.parse(json)
    }

    getNode(pt) {
        const key = pt.toString()
        let node = this.nodeCache[key]
        if (node) return node

        node = this.turtles.create(1, t => {
            t.setxy(...this.xfm.toWorld(pt))
        })
        this.nodeCache[key] = node
        return node
    }
    newLink(pt0, pt1) {
        const t0 = this.getNode(pt0)
        const t1 = this.getNode(pt1)
        return this.links.create(t0, t1)
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
        this.turtles.setDefault('atEdge', 'OK')

        const { Z, X, Y } = this.zxy
        this.bbox = gis.xy2bbox(X, Y, Z)
        this.xfm = this.world.bboxTransform(...this.bbox)
        console.log('bbox size', gis.lonLat2meters(...this.bbox))

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
    }
}
