import * as util from './utils.js'
import AgentList from './AgentList.js'

// Class Patch instances represent a rectangle on a grid.  They hold variables
// that are in the patches the turtles live on.  The set of all patches
// is the world on which the turtles live and the model runs.

// Flyweight object creation:
// Objects within AgentSets use "prototypal inheritance" via Object.create().
// Here, the Patch class is given to Patches for use creating Proto objects
// (new Patch(agentSet)), but only once per model/breed.
// The flyweight Patch objects are created via Object.create(protoObject),
// This lets the new Patch(agentset) object be "defaults".
// https://medium.com/dailyjs/two-headed-es6-classes-fe369c50b24

/**
 * Class Patch instances represent a square on the {@link Patches} grid.
 * They hold variables
 * that are in the patches the turtles live on.  The set of all patches
 * is the world on which the turtles live and the model runs.
 *
 * You do not use `new Patch`, rather Class {@link Model} creates the patches
 * for you, using the {@link World} data passed to the Model.
 *
 * You *never* do this:
 *
 */
class Patch {
    // Set by AgentSet
    agentSet
    model
    name

    turtles
    z = 0

    // static defaultVariables() {
    //     // Core variables for patches.
    //     return {
    //         turtles: undefined, // the turtles on me. Lazy evalued, see turtlesHere
    //         z: 0, // default shared z val. Can be overridden
    //     }
    // }
    // // Initialize a Patch given its Patches AgentSet.
    // constructor() {
    //     Object.assign(this, Patch.defaultVariables())
    // }
    // Getter for x,y derived from patch id, thus no setter.
    get x() {
        return (this.id % this.model.world.width) + this.model.world.minX
    }
    get y() {
        return (
            this.model.world.maxY - Math.floor(this.id / this.model.world.width)
        )
    }
    // get z() {
    //     return 0
    // }
    // set z(z) {}

    /**
     * Return whether or not this patch is on the edge of the atches.
     *
     * @returns {boolean}
     */
    isOnEdge() {
        return this.patches.isOnEdge(this)
    }

    // Getter for neighbors of this patch.
    // Uses lazy evaluation to promote neighbors to instance variables.
    // To avoid promotion, use `patches.neighbors(this)`.
    // Promotion makes getters accessed only once.
    // defineProperty required: can't set this.neighbors when getter defined.
    /**
     * Return an array of this patch's 8
     * [Moore neighbors](https://en.wikipedia.org/wiki/Moore_neighborhood).
     *
     * @returns {AgentArray}
     */
    get neighbors() {
        // lazy promote neighbors from getter to instance prop.
        const n = this.patches.neighbors(this)
        Object.defineProperty(this, 'neighbors', { value: n, enumerable: true })
        return n
    }
    /**
     * Return an array of this patch's 4
     * [Von Neumann neighbors](https://en.wikipedia.org/wiki/Von_Neumann_neighborhood)
     * (north, south, east, west).
     *
     * @returns {AgentArray}
     */
    get neighbors4() {
        const n = this.patches.neighbors4(this)
        Object.defineProperty(this, 'neighbors4', {
            value: n,
            enumerable: true,
        })
        return n
    }

    // Promote this.turtles on first call to turtlesHere.
    /**
     * Return an Array of the turtles on this patch.
     *
     * @returns {AgentArray}
     */
    get turtlesHere() {
        if (this.turtles == null) {
            this.patches.ask(p => {
                p.turtles = new AgentList(this.model)
            })
            this.model.turtles.ask(t => {
                t.patch.turtles.push(t)
            })
        }
        return this.turtles
    }
    // Returns above but returning only turtles of this breed.
    /**
     * Returns an Array of the particular breed on this patch.
     *
     * @param {String} breed
     * @returns {AgentArray}
     */
    breedsHere(breed) {
        const turtles = this.turtlesHere
        return turtles.withBreed(breed)
    }

    // 6 methods in both Patch & Turtle modules
    // Distance from me to x, y.
    // 2.5D: use z too if both z & this.z exist.
    // REMIND: No off-world test done
    distanceXY(x, y, z = null) {
        const useZ = z != null && this.z != null
        return useZ
            ? util.distance3(this.x, this.y, this.z, x, y, z)
            : util.distance(this.x, this.y, x, y)
    }
    // Return distance from me to object having an x,y pair (turtle, patch, ...)
    // 2.5D: use z too if both agent.z and this.z exist
    // distance (agent) { this.distanceXY(agent.x, agent.y) }
    distance(agent) {
        const { x, y, z } = agent
        return this.distanceXY(x, y, z)
    }

    // distanceXY(x, y) {
    //     return util.distance(this.x, this.y, x, y)
    // }
    // // Return distance from me to object having an x,y pair (turtle, patch, ...)
    // distance(agent) {
    //     return this.distanceXY(agent.x, agent.y)
    // }

    // Return heading towards agent/x,y using current geometry
    towards(agent) {
        return this.towardsXY(agent.x, agent.y)
    }
    towardsXY(x, y) {
        // return util.radiansTowardXY(this.x, this.y, x, y)
        let rads = util.radiansTowardXY(this.x, this.y, x, y)
        return this.model.fromRads(rads)
    }
    // Return patch w/ given parameters. Return undefined if off-world.
    // Return patch dx, dy from my position.
    patchAt(dx, dy) {
        return this.patches.patch(this.x + dx, this.y + dy)
    }
    patchAtHeadingAndDistance(heading, distance) {
        return this.patches.patchAtHeadingAndDistance(this, heading, distance)
    }

    sprout(num = 1, breed = this.model.turtles, initFcn = turtle => {}) {
        return breed.create(num, turtle => {
            turtle.setxy(this.x, this.y)
            initFcn(turtle)
        })
    }
}

export default Patch
