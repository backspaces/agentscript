// import * as util from '../src/utils.js'
var World = AS.World
var Model = AS.Model
// Current tile dataSet functions:
//   redfishUSDataSet
//   redfishWorldDataSet
//   mapzenDataSet
//   mapboxDataSet
import { mapzen as provider } from '../src/TileData.js'
// import { maptiler as provider } from '../src/TileData.js'

class DropletsModel extends Model {
    // atEdge = 'random'
    speed = 0.5
    puddleDepth = 5
    // stepType choices:
    //    'minNeighbor',
    //    'patchAspect',
    //    'dataSetAspectNearest',
    //    'dataSetAspectBilinear',
    // stepType = 'patchAspect'
    stepType = 'patchAspect'
    steps = 0
    // Installed datasets:
    elevation
    dzdx
    dzdy
    slope
    aspect

    // ======================

    constructor(worldOptions = World.defaultOptions(50)) {
        super(worldOptions)
    }

    // data can be gis zxy or a DataSet
    async startup(data = [13, 1594, 3339]) {
        this.elevation = data.width // is a dataset
            ? data
            : await provider.zxyToDataSet(...data)
        this.installDataSets(this.elevation)
    }
    installDataSets(elevation) {
        const slopeAndAspect = elevation.slopeAndAspect()
        const { dzdx, dzdy, slope, aspect } = slopeAndAspect
        Object.assign(this, { elevation, dzdx, dzdy, slope, aspect })

        this.patches.importDataSet(elevation, 'elevation', true)
        this.patches.importDataSet(aspect, 'aspect', true)
    }
    setup() {
        // this.turtles.setDefault('atEdge', this.atEdge)
        this.turtles.setDefault('atEdge', 'die')

        this.turtles.ask(t => (t.done = false))

        this.localMins = []
        this.patches.ask(p => {
            p.isLocalMin =
                p.neighbors.minOneOf('elevation').elevation > p.elevation
            if (p.isLocalMin) this.localMins.push(p)

            p.sprout(1, this.turtles)
        })
    }

    step() {
        this.steps = 0
        this.turtles.ask(t => {
            if (t.done) return

            const stepType = this.stepType

            if (stepType === 'minNeighbor') {
                // Face the best neighbor if better than me
                const n = t.patch.neighbors.minOneOf('elevation')
                if (t.patch.elevation > n.elevation) t.face(n)
            } else if (stepType === 'patchAspect') {
                t.theta = t.patch.aspect
            } else if (stepType.includes('dataSet')) {
                // Move in direction of aspect DataSet:
                const { minXcor, maxYcor, numX, numY } = this.world
                // bilinear many more minima
                const nearest = stepType === 'dataSetAspectNearest'
                t.theta = this.aspect.coordSample(
                    t.x,
                    t.y,
                    minXcor,
                    maxYcor,
                    numX,
                    numY,
                    nearest
                )
            } else {
                throw Error('bad stepType: ' + stepType)
            }

            let pAhead = t.patchAtHeadingAndDistance(t.heading, this.speed)
            if (!pAhead) {
                t.handleEdge(t.x, t.y) // t.die()
            } else if (
                t.patch.isLocalMin &&
                t.patch.turtlesHere.length < this.puddleDepth
            ) {
                t.setxy(t.patch.x, t.patch.y)
                t.done = true
            } else if (pAhead.turtlesHere.length < this.puddleDepth) {
                t.forward(this.speed)
                this.steps++
            } else {
                const n = t.patch.neighbors.oneOf()
                if (n.turtlesHere < this.puddleDepth) {
                    t.setxy(n.x, n.y)
                    this.steps++
                }

                // // turtlesHere at max, choose the best neighbor if one exists
                // let neighbors = t.patch.neighbors.with(
                //     n => n.turtlesHere < this.puddleDepth
                // )
                // if (neighbors.length > 0) {
                //     const n = neighbors.minOneOf('elevation')
                //     t.setxy(n.x, n.y)
                //     this.steps++
                // }
            }
        })
    }
    // turtlesOnLocalMins() {
    //     return this.localMins.reduce((acc, p) => acc + p.turtlesHere.length, 0)
    // }
}
const defaultModel = DropletsModel

