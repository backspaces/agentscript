import World from 'https://agentscript.org/src/World.js'
import Model from 'https://agentscript.org/src/Model.js'
import tileDataSet from 'https://agentscript.org/models/data/tile101x101.js'

class DropletsModel extends Model {
    speed = 0.5
    // stepType choices:
    //    'minNeighbor',
    //    'patchAspect',
    //    'dataSetAspectNearest',
    //    'dataSetAspectBilinear',
    stepType = 'minNeighbor'
    moves = 0 // how many moves in a step
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

    installDataSets(elevation) {
        const slopeAndAspect = elevation.slopeAndAspect()
        const { dzdx, dzdy, slope, aspect } = slopeAndAspect
        Object.assign(this, { elevation, dzdx, dzdy, slope, aspect })

        this.patches.importDataSet(elevation, 'elevation', true)
        this.patches.importDataSet(aspect, 'aspect', true)
    }
    setup() {
        this.elevation = tileDataSet

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
        if (this.done) return

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
        this.done = this.moves === 0
        if (this.done) console.log('No moves, stopping at step', this.ticks)
    }

    // Useful informational function: (not used by model but can be used by "app")
    turtlesOnLocalMins() {
        return this.localMins.reduce((acc, p) => acc + p.turtlesHere.length, 0)
    }
}

export default DropletsModel
