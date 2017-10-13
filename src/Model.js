import World from './World.js'
// import Color from './Color.js'
import Patches from './Patches.js'
import Patch from './Patch.js'
import Turtles from './Turtles.js'
import Turtle from './Turtle.js'
import Links from './Links.js'
import Link from './Link.js'
// import Animator from './Animator.js'
// import SpriteSheet from './SpriteSheet.js'
// import ThreeView from './ThreeView.js'
// import ThreeMeshes from './ThreeMeshes.js'
// import util from './util.js'

// Class Model is the primary interface for modelers, integrating
// all the parts of a model. It also contains NetLogo's `observer` methods.
class Model {
  // Static class methods for default settings.
  // Default world is centered, patchSize = 13, min/max = 16
  // static defaultWorld (size = 13, max = 16) {
  //   return World.defaultOptions(size, max)
  // }
  static defaultWorld (max = 16) {
    return World.defaultOptions(max)
  }
  // // Default renderer is ThreeView.js
  // static defaultRenderer () {
  //   return ThreeView.defaultOptions()
  // }
  // static printDefaultViewOptions () {
  //   ThreeView.printMeshOptions()
  // }

  // The Model constructor takes a DOM div and model and renderer options.
  // Default values are given for all constructor arguments.
  constructor (worldOptions = Model.defaultWorld()) {
    // Store and initialize the model's div and contexts.
    // this.div = util.isString(div) ? document.getElementById(div) : div
    // Create this model's `world` object
    this.world = new World(worldOptions)
    // Create animator to handle draw/step.
    // this.anim = new Animator(this)

    // View setup.
    // this.spriteSheet = new SpriteSheet()
    // Initialize view
    // this.view = new rendererOptions.Renderer(this, rendererOptions)
    // Initialize meshes.
    // this.meshes = {}
    // util.forEach(rendererOptions, (val, key) => {
    //   if (val.meshClass) {
    //     const Mesh = ThreeMeshes[val.meshClass]
    //     const options = Mesh.options() // default options
    //     Object.assign(options, val.options) // override by user's
    //     if (options.color) // convert options.color rgb array to Color.
    //       options.color = Color.toColor(new Float32Array(options.color))
    //     this.meshes[key] = new ThreeMeshes[val.meshClass](this.view, options)
    //   }
    // })

    // Initialize model calling `startup`, `reset` .. which calls `setup`.
    // this.modelReady = false
    // this.startup().then(() => {
    //   // this.reset(); this.setup(); this.modelReady = true
    //   this.reset(); this.modelReady = true
    // })
    this.reset() // REMIND: Temporary
  }
  // Call fcn(this) when any async
  // whenReady (fcn) {
  //   // util.waitPromise(() => this.modelReady).then(fcn())
  //   util.waitOn(() => this.modelReady, () => fcn(this))
  // }
  // Add additional world variables derived from constructor's `modelOptions`.
  // setWorld () {
  //   const world = this.world
  //   // REMIND: change to xPatches, yPatches?
  //   world.numX = world.maxX - world.minX + 1
  //   world.numY = world.maxY - world.minY + 1
  //   world.width = world.numX * world.patchSize
  //   world.height = world.numY * world.patchSize
  //   world.minXcor = world.minX - 0.5
  //   world.maxXcor = world.maxX + 0.5
  //   world.minYcor = world.minY - 0.5
  //   world.maxYcor = world.maxY + 0.5
  //   world.isOnWorld = (x, y) => // No braces, is lambda expression
  //     (world.minXcor <= x) && (x <= world.maxXcor) &&
  //     (world.minYcor <= y) && (y <= world.maxYcor)
  // }
  // createQuad (r, z = 0) { // r is radius of xy quad: [-r,+r], z is quad z
  //   const vertices = [-r, -r, z, r, -r, z, r, r, z, -r, r, z]
  //   const indices = [0, 1, 2, 0, 2, 3]
  //   return {vertices, indices}
  // }
  // (Re)initialize the model. REMIND: not quite right
  // setAgentSetViewProps (agentSet, mesh) {
  //   agentSet.isMonochrome = mesh.isMonochrome()
  //   agentSet.useSprites = mesh.useSprites()
  // }
  initAgentSet (name, AgentsetClass, AgentClass) {
    const agentset = new AgentsetClass(this, AgentClass, name)
    // const mesh = this.meshes[name]
    // const meshName = mesh.constructor.name
    this[name] = agentset
    // // agentset.setDefault('renderer', mesh)
    // agentset.renderer = mesh
    // if (mesh.fixedColor) agentset.setDefault('color', mesh.fixedColor)
    // // REMIND: Turtles only?
    // if (mesh.fixedShape) agentset.setDefault('shape', mesh.fixedShape)
    // // this.agentset.fixedColor = agentset.renderer.options.color
    // // agentset.useSprites = meshName in ['PointSpritesMesh', 'QuadSpritesMesh']
    // // agentset.fixedColor = agentset.renderer.options.color
    // // agentset.useSprites = meshName in ['PointSpritesMesh', 'QuadSpritesMesh']
    // // agentset.fixedShape =
    // mesh.init(agentset)
  }
  reset (restart = false) {
    // this.anim.reset()
    this.world.setWorld() // allow world to change?

    // this.refreshLinks = this.refreshTurtles = this.refreshPatches = true

    // Breeds handled by setup
    this.initAgentSet('patches', Patches, Patch)
    this.initAgentSet('turtles', Turtles, Turtle)
    this.initAgentSet('links', Links, Link)
    // this.patches = new Patches(this, Patch, 'patches')
    // this.patches.renderer = this.meshes.patches
    // this.meshes.patches.init(this.patches)
    // this.setAgentSetViewProps(this.patches, this.meshes.patches)
    //
    // this.turtles = new Turtles(this, Turtle, 'turtles')
    // this.turtles.renderer = this.meshes.turtles
    // this.meshes.turtles.init(this.turtles)
    // this.setAgentSetViewProps(this.turtles, this.meshes.turtles)
    //
    // this.links = new Links(this, Link, 'links')
    // this.turtles.links = this.meshes.links
    // this.meshes.links.init(this.links)
    // this.setAgentSetViewProps(this.links, this.meshes.links)

    // this.setup()
    if (restart) this.start()
  }

// ### User Model Creation
  // A user's model is made by subclassing Model and over-riding these
  // 2 abstract methods. `super` need not be called.

  setup () {} // Your initialization code goes here
  // Update/step your model here
  step () {} // called each step of the animation

  // Start/stop the animation. Return model for chaining.
  // start () {
  //   // util.waitOn(() => this.modelReady, () => {
  //   //   this.anim.start()
  //   // })
  //   this.anim.start()
  //   return this
  // }
  // stop () { this.anim.stop() }
  // // Animate once by `step(); draw()`.
  // once () { this.stop(); this.anim.once() } // stop is no-op if already stopped

  // Change the world parameters. Requires a reset.
  // Resets Patches, Turtles, Links & reinitializes canvases.
  // If restart argument is true (default), will restart after resetting.
  // resizeWorld (modelOptions, restart = true) {
  //   Object.assign(this.world, modelOptions)
  //   this.setWorld(this.world)
  //   this.reset(restart)
  // }

  // draw () {
  //   // // const {scene, camera} = this.view
  //   // if (this.div) {
  //   //   if (force || this.refreshPatches) {
  //   //     if (this.patches.length > 0)
  //   //       this.patches.renderer.update(this.patches)
  //   //   }
  //   //   if (force || this.refreshTurtles) {
  //   //     if (this.turtles.length > 0)
  //   //       this.turtles.renderer.update(this.turtles)
  //   //   }
  //   //   if (force || this.refreshLinks) {
  //   //     if (this.links.length > 0)
  //   //       this.links.renderer.update(this.links)
  //   //   }
  //   //
  //   //   // REMIND: generalize.
  //   //   this.view.renderer.render(this.view.scene, this.view.camera)
  //   // }
  //   // if (this.view.stats) this.view.stats.update()
  // }

  // Breeds: create breeds/subarrays of Patches, Agents, Links
  patchBreeds (breedNames) {
    for (const breedName of breedNames.split(' ')) {
      this[breedName] = this.patches.newBreed(breedName)
    }
  }
  turtleBreeds (breedNames) {
    for (const breedName of breedNames.split(' ')) {
      this[breedName] = this.turtles.newBreed(breedName)
    }
  }
  linkBreeds (breedNames) {
    for (const breedName of breedNames.split(' ')) {
      this[breedName] = this.links.newBreed(breedName)
    }
  }
}

export default Model
