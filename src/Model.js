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
    // The Model constructor takes a World or WorldOptions object.
    constructor(worldOptions = World.defaultOptions()) {
        this.resetModel(worldOptions)
    }

    resetModel(worldOptions) {
        const initAgentSet = (name, AgentsetClass, AgentClass) => {
            this[name] = new AgentsetClass(this, AgentClass, name)
        }
        this.ticks = 0
        this.world = new World(worldOptions)
        // Base AgentSets setup here. Breeds handled by setup
        initAgentSet('patches', Patches, Patch)
        initAgentSet('turtles', Turtles, Turtle)
        initAgentSet('links', Links, Link)
    }

    reset() {
        this.resetModel()
    }
    tick() {
        this.ticks++
    }

    // ### User Model Creation

    // A user's model is made by subclassing Model and over-riding these
    // 2 abstract methods. `super` need not be called.

    isAsync() {
        return this.startup.toString() !== 'async startup() {}'
    }
    async startup() {}
    setup() {} // Your initialization code goes here
    // Update/step your model here
    step() {} // called each step of the model

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

export default Model
