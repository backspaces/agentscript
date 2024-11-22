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
 * - startup(): (Optional) Called once to import images, data etc
 * - setup(): Called to initialize the model state.
 * - step(): Step the model. Will advance ticks.
 */

class Model {
    world
    patches
    turtles
    links
    ticks

    // set to true by subclasses to let animator and others know we're done
    done = false

    /**
     * Creates an instance of Model.
     * The worldOptions define the coordinate system for this model
     * The  {@link World} options sets xMin, xMax, yMin, yMax
     * and when using 3D: zMin, zMax
     *
     * Fine point: Can also be an instance of World or GeoWorld
     *
     * @constructor
     * @param {Object} [worldOptions=World.defaultOptions()]
     */
    constructor(worldOptions = World.defaultOptions()) {
        this.initModel(worldOptions)
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
    /**
     * Initialize model to initial state w/ new Patches, Turtles, Links.
     * The worldOptions will default to initial values but can be
     * changed by modeler.
     *
     * @param {Object|World} [worldOptions=this.world] World object
     */
    initModel(worldOptions) {
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
     * Reset the model by clearing the turtles, setting ID & ticks to 0
     * and calling setup()
     *
     * @param {boolean} [callSetup=true]
     */
    reset(callSetup = true) {
        this.turtles.clear()
        this.turtles.ID = 0
        this.ticks = 0
        this.done = false
        if (callSetup) this.setup()
    }

    /**
     * Increment the tick cound. Not needed if autoTick true, the default
     */
    tick() {
        this.ticks++
    }

    /**
     * An abstract method to perform one-time initialization.
     * Subclasses provide their versions of this to import data.
     *
     * @abstract
     */
    async startup() {}

    /**
     * An abstract method for initializing the model
     * Subclasses provide their version of this to initialice the model
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

    // A trick to auto advance ticks every step using a Proxy
    setAutoTick(autoTick = true) {
        const isAutoTick = !!this.stepTarget
        if (autoTick) {
            if (isAutoTick) return
            this.stepTarget = this.step
            this.step = new Proxy(this.stepTarget, {
                apply: (target, thisArg, args) => {
                    this.stepTarget()
                    this.tick()
                    // console.log('ticks', this.ticks)
                },
            })
        } else {
            this.step = this.stepTarget
            delete this.stepTarget
        }
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
// radians: radians counter-clockwise from the x-axis.
// degrees: degrees counter-clockwise from the x-axis.
// heading: "clock geometry", clockwise degrees from y axis
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
