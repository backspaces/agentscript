import World from './World.js'
import Patches from './Patches.js'
import Patch from './Patch.js'
import Turtles from './Turtles.js'
import Turtle from './Turtle.js'
import Links from './Links.js'
import Link from './Link.js'

// Class Model is the primary interface for modelers, integrating
// all the parts of a model. It also contains NetLogo's `observer` methods.
class Model {
  // Static class method for default setting.
  // Default world is centered, min/max = 16
  static defaultWorld (maxX = 16, maxY = maxX) {
    return World.defaultOptions(maxX, maxY)
  }

  // The Model constructor takes a World object.
  constructor (worldOptions = Model.defaultWorld()) {
    this.worldOptions = worldOptions
    this.resetModel() // REMIND: Temporary. Inline?
  }
  initAgentSet (name, AgentsetClass, AgentClass) {
    const agentset = new AgentsetClass(this, AgentClass, name)
    this[name] = agentset
  }
  resetModel () {
    this.world = new World(this.worldOptions)
    // Base AgentSets setup here. Breeds handled by setup
    this.initAgentSet('patches', Patches, Patch)
    this.initAgentSet('turtles', Turtles, Turtle)
    this.initAgentSet('links', Links, Link)
  }
  reset () {
    this.resetModel()
  }

  // ### User Model Creation

  // A user's model is made by subclassing Model and over-riding these
  // 2 abstract methods. `super` need not be called.

  setup () {} // Your initialization code goes here
  // Update/step your model here
  step () {} // called each step of the model

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
