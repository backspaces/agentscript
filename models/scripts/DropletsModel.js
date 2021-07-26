// import * as util from '../src/utils.js'
var World = AS.World
var Model = AS.Model
// Current tile dataSet functions:
//   redfishUSDataSet
//   redfishWorldDataSet
//   mapzenDataSet
//   mapboxDataSet
// Use mapzenDataSet for free amazon elevation,
// redfishUSDataSet for high rez, mapboxDataSet for mapbox
var TileDataSet = AS.TileDataSet

class DropletsModel extends Model {
    zxy = [13, 1594, 3339]
    killOffworld = false // Kill vs clamp turtles when offworld.
    speed = 0.2
    // stepType choices:
    //    'minNeighbor',
    //    'patchAspect',
    //    'dataSetAspectNearest',
    //    'dataSetAspectBilinear',
    stepType = 'dataSetAspectNearest'
    elevation
    dzdx
    dzdy
    slope
    aspect

    // ======================

    constructor(worldOptions = World.defaultOptions(50)) {
        super(worldOptions)
    }

    async startup() {
        const elevation = await TileDataSet.mapzenDataSet(...this.zxy)
        this.installDataSets(elevation)
    }
    installDataSets(elevation) {
        const slopeAndAspect = elevation.slopeAndAspect()
        const { dzdx, dzdy, slope, aspect } = slopeAndAspect
        Object.assign(this, { elevation, dzdx, dzdy, slope, aspect })

        this.patches.importDataSet(elevation, 'elevation', true)
        this.patches.importDataSet(aspect, 'aspect', true)
    }
    setup() {
        // Kill if droplet moves off world/tile.
        // Otherwise use 'clamp' (bunch up on edge)
        if (this.killOffworld) {
            this.turtles.setDefault('atEdge', turtle => turtle.die())
        }

        this.localMins = []
        this.patches.ask(p => {
            if (p.neighbors.minOneOf('elevation').elevation > p.elevation) {
                this.localMins.push(p)
            }
            p.sprout(1, this.turtles)
        })
    }

    step() {
        this.turtles.ask(t => {
            let move = true
            const stepType = this.stepType

            if (stepType === 'minNeighbor') {
                const n = t.patch.neighbors.minOneOf('elevation')
                if (t.patch.elevation > n.elevation) {
                    // Face the best neighbor if better than me
                    t.face(n)
                } else {
                    // Otherwise place myself at my patch center
                    t.setxy(t.patch.x, t.patch.y)
                    move = false
                }
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

            if (move) t.forward(this.speed)
        })
    }
    turtlesOnLocalMins() {
        return this.localMins.reduce(
            // (acc, p) => acc + p.turtlesHere().length,
            (acc, p) => acc + p.turtlesHere.length,
            0
        )
    }
}
const defaultModel = DropletsModel

