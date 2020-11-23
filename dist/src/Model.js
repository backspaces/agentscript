import World from './World.js'
import Patches from './Patches.js'
import Patch from './Patch.js'
import Turtles from './Turtles.js'
import Turtle from './Turtle.js'
import Links from './Links.js'
import Link from './Link.js'

/**
 * @description
 * Class Model is the primary interface for modelers, integrating
 * the Patches/Patch Turtles/Turtle and Links/Link AgentSets .. i.e.:
 * * model.Patches is an array ({@link Patches}) of {@link Patch} instances
 * * model.Turtles is an array ({@link Turtles}) of {@link Turtle} instances
 * * model.Links is an array ({@link Links}) of {@link Link} instances
 * * model.breed is a sub-array of any of the three above. See AgentSet's ctor.
 * * All of which are subclasses of ({@link AgentSet})
 *
 * Convention: Three abstract methods are provided by the modeler
 * * Startup(): (Optional) Called once to import images, data etc
 * * Setup(): Called to initialize the model state. Can be called multiple times, see reset()
 * * Step(): Step the model. Will advance ticks if autoTick = true in constructor.
 *
 * See {@tutorial HelloModel}
 */
class Model {
    world
    patches
    turtles
    links

    /**
     * Creates an instance of Model.
     * @param {Object|World} [worldOptions=World.defaultOptions()] Can be Object of min/max X,Y,Z values or an instance of World
     * @param {boolean} [autoTick=true] Automatically advancee tick count each step if true
     */
    constructor(worldOptions = World.defaultOptions(), autoTick = true) {
        // Let jsDocs/vscode know these variables exist. Initialized by reseetModel()
        // this.patches = this.turtles = this.links = null
        this.resetModel(worldOptions)
        if (autoTick) this.autoTick()
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

    /**
     * Resets model to initial state w/ new Patches, Turtles, Links.
     * The worldOptions will default to initial values but can be
     * changed by modeler.
     *
     * @param {Object|World} [worldOptions=this.world] World object
     */
    reset(worldOptions = this.world) {
        this.resetModel(worldOptions)
    }

    /**
     * Increment the tick cound. Generally not needed if autoTick true
     */
    tick() {
        this.ticks++
    }

    // ### User Model Creation

    /**
     * A method to perform one-time initialization
     *
     * @abstract
     */
    async startup() {}

    /**
     * A method for initializing the model
     *
     * Note: can be used with reset(). This will reinitialize
     * the Patches, Turtles, Links for re-running the model
     *  * reset()
     *  * setup()
     *
     * @abstract
     */
    setup() {} // Your initialization code goes here
    /**
     * Run the model one step.
     *
     * @abstract
     */
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
    /**
     * Create breeds (sub-arrays) of Patches. Used in the Exit model:
     * * this.patchBreeds('exits inside wall')
     *
     * @param {string} breedNames A string of space separated breeds names
     */
    patchBreeds(breedNames) {
        for (const breedName of breedNames.split(' ')) {
            this[breedName] = this.patches.newBreed(breedName)
        }
    }
    /**
     * Create breeds (sub-arrays) of Turtles. Used in Wallfollower model:
     * * this.turtleBreeds('lefty righty')
     *
     * @param {string} breedNames A string of space separated breeds names
     */
    turtleBreeds(breedNames) {
        for (const breedName of breedNames.split(' ')) {
            this[breedName] = this.turtles.newBreed(breedName)
        }
    }
    /**
     * Create breeds (sub-arrays) of Links. Used in Roads model:
     * * this.linkBreeds('trips')
     *
     * @param {string} breedNames A string of space separated breeds names
     */
    linkBreeds(breedNames) {
        for (const breedName of breedNames.split(' ')) {
            this[breedName] = this.links.newBreed(breedName)
        }
    }
}

export default Model
