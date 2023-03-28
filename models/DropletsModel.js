/*
    Note: this is the only model that has dom methods.
    To keep the model/view split clean, we provide a
    pre-built dataset created from a 256x256 gis tile (needing dom methods)
    scaled to 101x101 and thus does not need any of the dom methods
*/
import * as util from '../src/utils.js'
import World from '../src/World.js'
import Model from '../src/Model.js'
import tileDataSet from './data/tile101x101.js'
// Current tile dataSet functions:
//   redfishUSDataSet
//   redfishWorldDataSet
//   mapzenDataSet
//   mapboxDataSet
import { mapzen as provider } from '../src/TileData.js'
import BBoxDataSet from '../src/BBoxDataSet.js'

export default class DropletsModel extends Model {
    speed = 0.5
    // stepType choices:
    //    'minNeighbor',
    //    'patchAspect',
    //    'dataSetAspectNearest',
    //    'dataSetAspectBilinear',
    stepType = 'minNeighbor'
    moves // how many moves in a step
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

    // data can be gis [z, x, y], [bbox, z], z, or a DataSet
    // if world is a geoworld: [world.bbox, z]
    async startup(data = tileDataSet) {
        if (util.isDataSet(data)) {
            // data is a dataset, use as is.
            // workers: reconstruct the dataset object via
            //   new DataSet(width, height, data)
            this.elevation = data
        } else if (Array.isArray(data)) {
            // && data.length === 3) {
            if (data.length === 3) {
                // data is [z, x, y] array
                this.elevation = await provider.zxyToDataSet(...data)
            } else if (data.length === 2) {
                // data is [bbox, zoom]
                this.elevation = await new BBoxDataSet().getBBoxDataSet(...data)
            }
        } else if (typeof data === 'number') {
            // data is zoom; use world.bbox for bbox
            const bbox = this.world.bbox
            const zoom = data
            if (bbox) {
                const bboxDataSet = new BBoxDataSet()
                this.elevation = await bboxDataSet.getBBoxDataSet(bbox, zoom)
            }
        }

        if (!this.elevation)
            throw Error(
                'model startup: data argument is not one of [z, x, y], [bbox, z], z, or a DataSet'
            )
    }
    installDataSets(elevation) {
        const slopeAndAspect = elevation.slopeAndAspect()
        const { dzdx, dzdy, slope, aspect } = slopeAndAspect
        Object.assign(this, { elevation, dzdx, dzdy, slope, aspect })

        this.patches.importDataSet(elevation, 'elevation', true)
        this.patches.importDataSet(aspect, 'aspect', true)
    }
    setup() {
        this.installDataSets(this.elevation)

        // handled by step():
        // this.turtles.setDefault('atEdge', 'die')

        this.turtles.ask(t => (t.done = false))

        this.localMins = []
        this.patches.ask(p => {
            p.isLocalMin =
                p.neighbors.minOneOf('elevation').elevation > p.elevation
            if (p.isLocalMin) this.localMins.push(p)

            p.sprout(1, this.turtles)
        })
    }

    faceDownhill(t) {
        if (this.stepType === 'minNeighbor') {
            // Face the best neighbor if better than me
            const n = t.patch.neighbors.minOneOf('elevation')
            if (t.patch.elevation > n.elevation) t.face(n)
        } else if (this.stepType === 'patchAspect') {
            t.theta = t.patch.aspect
        } else if (this.stepType.includes('dataSet')) {
            // Move in direction of aspect DataSet:
            const { minXcor, maxYcor, numX, numY } = this.world
            // bilinear many more minima
            const nearest = this.stepType === 'dataSetAspectNearest'
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
            throw Error('bad stepType: ' + this.stepType)
        }
    }

    handleLocalMin(t) {
        if (t.patch.isLocalMin) {
            // center t in patch, and mark as done
            t.setxy(t.patch.x, t.patch.y)
            t.done = true
        }
    }
    patchOK(t, p) {
        return p.elevation < t.patch.elevation
    }

    step() {
        this.moves = 0
        this.turtles.ask(t => {
            if (t.done) return

            this.faceDownhill(t)
            const pAhead = t.patchAtHeadingAndDistance(t.heading, this.speed)

            if (!pAhead) {
                t.die()
            } else if (pAhead === t.patch || this.patchOK(t, pAhead)) {
                t.forward(this.speed)
                this.handleLocalMin(t)
                this.moves++
            } else {
                t.done = true
            }
        })
    }

    // Useful informational function: (not used by model but can be used by "app")
    turtlesOnLocalMins() {
        return this.localMins.reduce((acc, p) => acc + p.turtlesHere.length, 0)
    }
}
