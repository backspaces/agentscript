var util = AS.util
var World = AS.World
var Model = AS.Model
var AgentArray = AS.AgentArray
var RGBDataSet = AS.RGBDataSet

class DropletsModel extends Model {
    static defaultOptions() {
        return {
            // stepType choices:
            //    'minNeighbor',
            //    'patchAspect',
            //    'dataSetAspectNearest',
            //    'dataSetAspectBilinear',
            stepType: 'dataSetAspectNearest',
            killOffworld: false, // Kill vs clamp turtles when offworld.
            // tile: './dropletstile.png',
            // tile:
            //     'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/13/1594/3339.png',
            tile:
                'https://s3-us-west-2.amazonaws.com/simtable-elevation-tiles/13/1594/3339.png',
            speed: 0.2,
        }
    }
    // ======================

    constructor(worldDptions = World.defaultOptions(50)) {
        super(worldDptions)
        Object.assign(this, DropletsModel.defaultOptions())
    }

    async startup() {
        // const png = await util.imagePromise(this.tile)
        const png = self.ImageBitmap
            ? await util.imageBitmapPromise(this.tile)
            : await util.imagePromise(this.tile)
        console.log('png', png)
        const elevation = this.tile.includes('simtable-elevation-tiles')
            ? new RGBDataSet(png, RGBDataSet.redfishRGBFcn, AgentArray)
            : new RGBDataSet(png, -32768, 1 / 256, AgentArray)
        this.installDataSets(elevation)

        // const slopeAndAspect = elevation.slopeAndAspect()
        // const { dzdx, dzdy, slope, aspect } = slopeAndAspect
        // Object.assign(this, { elevation, dzdx, dzdy, slope, aspect })

        // this.patches.importDataSet(elevation, 'elevation', true)
        // this.patches.importDataSet(aspect, 'aspect', true)
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
        // Otherwise default 'clamp' (bunch up on edge)
        if (this.killOffworld) {
            this.turtles.setDefault('atEdge', turtle => turtle.die())
        }
        // this.speed = 0.2

        this.localMins = [] // new AgentArray()
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
const defaultModel = DropletsModel

