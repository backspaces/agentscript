import World from './World.js'
import GeoWorld from './GeoWorld.js'
import Patches from './Patches.js'
import Patch from './Patch.js'
import Turtles from './Turtles.js'
import Turtle from './Turtle.js'
import Links from './Links.js'
import Link from './Link.js'

/**
 * Class Model is the primary interface for modelers, integrating
 * the Patches/Patch Turtles/Turtle and Links/Link AgentSets .. i.e.:
 *
 * - model.Patches: an array {@link Patches} of {@link Patch} instances
 * - model.Turtles: an array {@link Turtles} of {@link Turtle} instances
 * - model.Links: an array {@link Links} of {@link Link} instances
 * - model.breed: a sub-array of any of the three above.
 * - All of which are subclasses of {@link AgentSet}.
 *
 * Convention: Three abstract methods are provided by the modeler
 *
 * - Startup(): (Optional) Called once to import images, data etc
 * - Setup(): Called to initialize the model state.
 * - Step(): Step the model. Will advance ticks.
 *
 * @param {Object|World} [worldOptions=World.defaultOptions()]
 * Can be Object of min/max X,Y,Z values or an instance of World or GeoWorld
 */
//  * @param {boolean} [autoTick=true] Automatically advancee tick count each step if true

class Model {
    world
    patches
    turtles
    links
    ticks

    constructor(worldOptions = World.defaultOptions()) {
        this.resetModel(worldOptions)
        this.setAutoTick(true)
        this.setGeometry('heading')
    }

    initAgentSet(name, AgentsetClass, AgentClass) {
        this[name] = new AgentsetClass(this, AgentClass, name)
    }

    options2world(worldOptions) {
        return worldOptions.bbox
            ? new GeoWorld(worldOptions)
            : new World(worldOptions)
    }
    resetModel(worldOptions) {
        this.ticks = 0
        this.world =
            worldOptions.maxXcor === undefined // is already a world object
                ? this.options2world(worldOptions)
                : worldOptions
        // Base AgentSets setup here. Breeds handled by setup
        this.initAgentSet('patches', Patches, Patch)
        this.initAgentSet('turtles', Turtles, Turtle)
        this.initAgentSet('links', Links, Link)
    }

    /**
     * Resets model to initial state w/ new Patches, Turtles, Links.
     * The worldOptions will default to initial values but can be
     * changed by modeler. Setup() often called after reset() to
     * re-initialize the model.
     *
     * @param {Object|World} [worldOptions=this.world] World object
     */
    reset(worldOptions = this.world) {
        this.resetModel(worldOptions)
    }

    /**
     * Increment the tick cound. Not needed if autoTick true, the default
     */
    tick() {
        this.ticks++
    }

    /**
     * An abstract method to perform one-time initialization.
     *
     * @abstract
     */
    async startup() {}

    /**
     * An abstract method for initializing the model
     *
     * Note: can be used with reset(). This will reinitialize
     * the Patches, Turtles, Links for re-running the model
     *  * reset()
     *  * setup()
     *
     * @abstract
     */
    setup() {}
    /**
     * An abstract method to run the model one step.
     *
     * @abstract
     */
    step() {}

    // A trick to auto advance ticks every step
    setAutoTick(autoTick = true) {
        const isAutoTick = this.hasOwnProperty('step')
        if (autoTick) {
            if (isAutoTick) return
            this.step0 = this.step
            this.step = this.stepAndTick
        } else {
            delete this.step
            delete this.step0
        }
    }
    stepAndTick() {
        this.step0()
        // super.step()
        this.tick()
    }

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

    setGeometry(name = 'heading') {
        const geometry = geometries[name]
        if (!geometry) throw Error(`setGeometry: ${name} geometry not defined`)
        Object.assign(this, geometry)
    }
}
// Five geometry functions converting to the JavaScript
// standard: radians counter-clockwise from the x-axis.
// The default set is for "heading" or "clock" geometry,
// Degrees clockwise from the y-axis.
// Add mod2pi & mod360?
const toDeg = 180 / Math.PI
const toRad = Math.PI / 180
const geometries = {
    radians: {
        toRads: rads => rads,
        fromRads: rads => rads,
        toAngleRads: rads => rads,
        fromAngleRads: rads => rads,
        toCCW: angle => angle,
    },
    degrees: {
        toRads: deg => deg * toRad,
        fromRads: rads => rads * toDeg,
        toAngleRads: deg => deg * toRad,
        fromAngleRads: rads => rads * toDeg,
        toCCW: angle => angle,
    },
    heading: {
        toRads: deg => (90 - deg) * toRad,
        fromRads: rads => 90 - rads * toDeg,
        toAngleRads: deg => deg * toRad,
        fromAngleRads: rads => rads * toDeg,
        toCCW: angle => -angle,
    },
}

export default Model
