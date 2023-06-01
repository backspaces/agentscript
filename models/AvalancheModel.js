import World from '../src/World.js'
import Model from '../src/Model.js'
import { mapzen as provider } from '../src/TileData.js'
import { xyz2bbox, bboxMetricSize } from '../src/gis.js'

const pi = Math.PI
/**
 *
 * Model
 *
 * **/
export default class AvalancheModel extends Model {
    // ======================
    constructor(worldOptions = World.defaultOptions(50)) {
        super(worldOptions)
    }

    // data can be gis zxy or a DataSet
    async startup() {
        const z = 13,
            x = 1555,
            y = 3084
        const bounds = xyz2bbox(x, y, z) // alta utah. USA
        const elev = await provider.zxyToDataSet(z, x, y)
        this.installDataSets(elev)
    }

    installDataSets(elevation) {
        const { slope, aspect, dzdx, dzdy } = elevation.slopeAndAspect()
        this.patches.importDataSet(aspect, 'aspect')
        this.patches.importDataSet(slope, 'slope')
        this.patches.importDataSet(dzdx, 'dzdx')
        this.patches.importDataSet(dzdy, 'dzdy')
        this.patches.importDataSet(elevation, 'elevation')
        // for 3d
        const elevationScaled = elevation.clone().scale(-10, 10)
        this.patches.importDataSet(elevationScaled, 'z', true) // for drawing
    }
    setup() {
        this.patches.ask(p => {
            p.snowDepth = 1
        })
    }
    step() {
        // start new buffer
        this.patches.ask(p => (p.nextSnow = p.snowDepth))
        // drop snow
        this.patches.ask(p => (p.nextSnow += +0.01))
        // make avalanche
        this.patches.ask(p => {
            const maxSnowDepth = pi / p.slope
            if (p.snowDepth > maxSnowDepth) {
                //choose the 2 downhill neighbors to give snow to
                const n = Math.min(2, p.neighbors.length)
                p.neighbors
                    .minNOf(n, 'elevation')
                    .ask(p2 => (p2.nextSnow = p2.nextSnow + p.snowDepth / n))
                p.nextSnow = 0
            }
        })
        // swap buffer
        this.patches.ask(p => (p.snowDepth = p.nextSnow))
    }
}
