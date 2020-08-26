import World from './World.js'
import Patches from './Patches.js'
import Patch from './Patch.js'
import Turtles from './Turtles.js'
import Turtle from './Turtle.js'
import Links from './Links.js'
import Link from './Link.js'

// Class Model is the primary interface for modelers, integrating
// all the parts of a model. It also contains NetLogo's `observer` methods.
export default class Model {
    // The Model constructor takes a World or WorldOptions object.
    constructor(worldOptions = World.defaultOptions()) {
        this.resetModel(worldOptions)
        this.autoTick()
    }

    // Intercepted by Model3D to use Turtle3D AgentClass
    initAgentSet(name, AgentsetClass, AgentClass) {
        this[name] = new AgentsetClass(this, AgentClass, name)
    }

    resetModel(worldOptions) {
        this.ticks = 0
        this.world =
            worldOptions.maxXcor === undefined
                ? new World(worldOptions)
                : worldOptions
        // Base AgentSets setup here. Breeds handled by setup
        this.initAgentSet('patches', Patches, Patch)
        this.initAgentSet('turtles', Turtles, Turtle)
        this.initAgentSet('links', Links, Link)
    }

    reset(worldOptions = this.world) {
        this.resetModel(worldOptions)
    }
    tick() {
        this.ticks++
    }

    // ### User Model Creation

    // A user's model is made by subclassing Model and over-riding these
    // 3 abstract methods. `super` should not be called.
    async startup() {} // One-time async data fetching goes here.
    setup() {} // Your initialization code goes here
    step() {} // Called each step of the model

    // A trick to auto advance ticks every step
    stepAndTick() {
        this.step0()
        this.tick()
    }
    autoTick() {
        this.step0 = this.step
        this.step = this.stepAndTick
    }

    // Breeds: create breeds/subarrays of Patches, Agents, Links
    patchBreeds(breedNames) {
        for (const breedName of breedNames.split(' ')) {
            this[breedName] = this.patches.newBreed(breedName)
        }
    }
    turtleBreeds(breedNames) {
        for (const breedName of breedNames.split(' ')) {
            this[breedName] = this.turtles.newBreed(breedName)
        }
    }
    linkBreeds(breedNames) {
        for (const breedName of breedNames.split(' ')) {
            this[breedName] = this.links.newBreed(breedName)
        }
    }
}
