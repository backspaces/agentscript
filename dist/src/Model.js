import World from './World.js'
import Patches from './Patches.js'
import Patch from './Patch.js'
import Turtles from './Turtles.js'
import Turtle from './Turtle3D.js'
import Links from './Links.js'
import Link from './Link.js'

/**
 * Class Model is the primary interface for modelers, integrating
 * the Patches/Patch Turtles/Turtle and Links/Link AgentSets .. i.e.:
 *
 * - model.Patches: an array ({@link Patches}) of {@link Patch} instances
 * - model.Turtles: an array ({@link Turtles}) of {@link Turtle} instances
 * - model.Links: an array ({@link Links}) of {@link Link} instances
 * - model.breed: a sub-array of any of the three above.
 * - All of which are subclasses of ({@link AgentSet}).
 *
 * Convention: Three abstract methods are provided by the modeler
 *
 * - Startup(): (Optional) Called once to import images, data etc
 * - Setup(): Called to initialize the model state.
 * - Step(): Step the model. Will advance ticks if autoTick = true in constructor.
 *
 * @param {Object|World} [worldOptions=World.defaultOptions()]
 * Can be Object of min/max X,Y,Z values or an instance of World
 * @param {boolean} [autoTick=true] Automatically advancee tick count each step if true
 */
export default class Model {
    world
    patches
    turtles
    links
    ticks

    constructor(worldOptions = World.defaultOptions(), autoTick = true) {
        this.resetModel(worldOptions)
        if (autoTick) this.autoTick()
        // this.setGeometry(this.geometry)
    }

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
     * changed by modeler. Setup() often called after reset() to
     * re-initialize the model.
     *
     * @param {Object|World} [worldOptions=this.world] World object
     */
    reset(worldOptions = this.world) {
        this.resetModel(worldOptions)
    }

    /**
     * Increment the tick cound. Not needed if autoTick true
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
    stepAndTick() {
        this.step0()
        this.tick()
    }
    autoTick() {
        this.step0 = this.step
        this.step = this.stepAndTick
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
    // /**
    //  * Set the Geometry of this Model
    //  * * radians: Set the model to use native Javascript angles.<br>
    //  *   [See Math module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math#converting_between_degrees_and_radians)
    //  * * degrees: Use degrees rather than radians. <br>
    //  *   The above with degree<>radian conversions done for you.
    //  * * heading: Use "Clock" geometry:<br>
    //  *   Degrees with 0 "up" and angles Clockwise.
    //  * @param {string} name One of 'radians', 'degrees', 'heading'
    //  */
    // setGeometry(name) {
    //     const geometry = geometries[name]
    //     if (!geometry)
    //         throw Error(`model.setGeometry: ${name} geometry not defined`)
    //     Object.assign(this, geometry)
    //     this.geometry = name
    // }

    toRads = deg => (90 - deg) * toRad
    fromRads = rads => 90 - rads * toDeg
    toAngleRads = deg => deg * toRad
    toCCW = angle => -angle
}

const mod = (val, n) => ((val % n) + n) % n // believe it or not!
const mod360 = degrees => mod(degrees, 360)
const mod2pi = radians => mod(radians, 2 * Math.PI)

// Add mod2pi & mod360
const toDeg = 180 / Math.PI
const toRad = Math.PI / 180

// let toRads = deg => (90 - deg) * toRad
// let fromRads = rads => 90 - rads * toDeg
// let toAngleRads = deg => deg * toRad
// let toCCW = angle => -angle

// const geometries = {
//     radians: {
//         toRads: rads => rads,
//         fromRads: rads => rads,
//         toAngleRads: rads => rads,
//         toCCW: angle => angle,
//         // toDeltaRads: rads => rads,
//         // fromDeltaRads: rads => rads,
//     },
//     degrees: {
//         toRads: deg => deg * toRad,
//         fromRads: rads => rads * toDeg,
//         toAngleRads: deg => deg * toRad,
//         toCCW: angle => angle,
//         // toDeltaRads: deg => deg * toRad,
//         // fromDeltaRads: rads => rads * toDeg,
//     },
//     heading: {
//         toRads: deg => (90 - deg) * toRad,
//         fromRads: rads => 90 - rads * toDeg,
//         toAngleRads: deg => deg * toRad,
//         toCCW: angle => -angle,
//         // toDeltaRads: deg => -deg * toRad,
//         // fromDeltaRads: rads => -rads * toDeg,
//     },
// }

// export default Model
