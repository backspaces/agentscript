import util from '../src/util.js'
import Model from '../src/Model.js'
import AgentArray from '../src/AgentArray.js'
import RGBDataSet from '../src/RGBDataSet.js'

export default class DropletsModel extends Model {
    static defaults() {
        return {
            // stepType choices:
            //    'minNeighbor',
            //    'patchAspect',
            //    'dataSetAspectNearest',
            //    'dataSetAspectBilinear',
            stepType: 'dataSetAspectNearest',
            killOffworld: false, // Kill vs clamp turtles when offworld.
            url:
                'http://s3.amazonaws.com/elevation-tiles-prod/terrarium/13/1594/3339.png',
            speed: 0.2,
        }
    }
    // ======================

    constructor(options) {
        super(options)
        Object.assign(this, DropletsModel.defaults())
    }

    async startup() {
        const png = await util.imagePromise(this.url)
        const elevation = new RGBDataSet(png, -32768, 1 / 256, AgentArray)

        const slopeAndAspect = elevation.slopeAndAspect()
        const { dzdx, dzdy, slope, aspect } = slopeAndAspect
        Object.assign(this, { elevation, dzdx, dzdy, slope, aspect })

        this.patches.importDataSet(elevation, 'elevation', true)
        this.patches.importDataSet(aspect, 'aspect', true)
    }
    setup() {
        // Kill if droplet moves off world/tile.
        // Otherwise default 'clamp' (bunch up on edge)
        if (this.killOffworld) {
            this.turtles.setDefault('atEdge', turtle => turtle.die())
        }
        // this.speed = 0.2

        this.localMins = new AgentArray()
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
            (acc, p) => acc + p.turtlesHere().length,
            0
        )
    }
}
