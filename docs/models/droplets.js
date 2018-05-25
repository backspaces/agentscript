import {AgentArray, RGBDataSet, Model, *, util} from '../dist/agentscript.esm.js'

util.toWindow({ AgentArray, Model, RGBDataSet, modelIO, util })

class DropletsModel extends Model {
  static stepTypes () {
    return {
      minNeighbor: 'minNeighbor',
      patchAspect: 'patchAspect',
      dataSetAspectNearest: 'dataSetAspectNearest',
      dataSetAspectBilinear: 'dataSetAspectBilinear'
    }
  }
  async startup () {
    // These are options for the step() behavior:
    this.stepType = DropletsModel.stepTypes().dataSetAspectNearest
    this.killOffworld = false // Kill or clamp turtles when offworld.
    console.log('StepType:', this.stepType, 'killOffworld:', this.killOffworld)

    // let elevation
    // if (typeof elevationJson === 'undefined') {
    const url =
      'http://s3.amazonaws.com/elevation-tiles-prod/terrarium/13/1594/3339.png'
    const png = await util.imagePromise(url)
    util.toWindow({png})
    // const elevation = new RGBDataSet(png, -32768, 1 / 256, AgentArray)
    const elevation = new RGBDataSet(png, -32768, 1 / 256, AgentArray)
    // } else {
    //   // for some reason, the injected json is turned into an obj!
    //   // no need for JSON.parse. weird.
    //   /* eslint-disable */ // injected var not declared
    //   elevation = new DataSet(
    //     elevationJson.width,
    //     elevationJson.height,
    //     elevationJson.data
    //   )
    //   /* eslint-enable */
    // }

    const slopeAndAspect = elevation.slopeAndAspect()
    const {dzdx, dzdy, slope, aspect} = slopeAndAspect
    Object.assign(this, {elevation, dzdx, dzdy, slope, aspect})
    util.toWindow({elevation, dzdx, dzdy, slope, aspect})

    const logHist = (name, ds = this[name]) => {
      const hist = AgentArray.fromArray(ds.data).histogram()
      const {min, max} = hist.parameters
      console.log(`${name}:`, hist.toString(), 'min/max:', min.toFixed(3), max.toFixed(3))
    }
    logHist('elevation')
    logHist('aspect')
    logHist('slope')
    logHist('dzdx')
    logHist('dzdy')

    this.patches.importDataSet(elevation, 'elevation', true)
    this.patches.importDataSet(aspect, 'aspect', true)
  }
  setup () {
    const patchElevations = this.patches.exportDataSet('elevation', AgentArray)

    // Kill if droplet moves off world/tile.
    // Otherwise default 'clamp' (bunch up on edge)
    if (this.killOffworld)
      this.turtles.setDefault('atEdge', turtle => turtle.die())
    this.speed = 0.2

    this.localMins = new AgentArray()
    this.patches.ask(p => {
      if (p.neighbors.minOneOf('elevation').elevation > p.elevation) {
        this.localMins.push(p)
      }
      p.sprout(1, this.turtles)
    })
    util.toWindow({patchElevations, localMins: this.localMins})
  }

  step () {
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
        const {minXcor, maxYcor, numX, numY} = this.world
        // bilinear many more minima
        const nearest = stepType === 'dataSetAspectNearest'
        t.theta = this.aspect.coordSample(
          t.x, t.y, minXcor, maxYcor, numX, numY, nearest
        )
      } else {
        throw Error('bad stepType: ' + stepType)
      }

      if (move) t.forward(this.speed)
    })
  }
  turtlesOnLocalMins () {
    return this.localMins.reduce(
      (acc, p) => acc + p.turtlesHere().length, 0
    )
  }
}

const usingPuppeteer = navigator.userAgent === 'Puppeteer'
if (usingPuppeteer) util.randomSeed()

const options = Model.defaultWorld(50)
const model = new DropletsModel(options)
const {world, patches, turtles, links} = model
util.toWindow({ world, patches, turtles, links, model })

model.startup().then(() => {
  model.setup()
  modelIO.printToPage('patches: ' + model.patches.length)
  modelIO.printToPage('turtles: ' + model.turtles.length)
  modelIO.printToPage('localMins: ' + model.localMins.length)
  modelIO.printToPage('turtlesOnMin: ' + model.turtlesOnLocalMins())

  util.yieldLoop(() => model.step(), 500)

  modelIO.printToPage('')
  modelIO.printToPage('Done:')
  if (model.killOffworld)
    modelIO.printToPage('turtles: ' + model.turtles.length)
  modelIO.printToPage('turtlesOnMin: ' + model.turtlesOnLocalMins())

  modelIO.printToPage('')
  modelIO.printToPage(modelIO.sampleObj(model))

  if (usingPuppeteer) {
    window.modelDone = model.modelDone = true
    window.modelSample = model.modelSample = modelIO.sampleJSON(model)
  }
})


