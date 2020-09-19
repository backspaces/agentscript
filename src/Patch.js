import util from './util.js'
import AgentArray from './AgentArray.js'

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
export default class Patch {
    static defaultVariables() {
        // Core variables for patches.
        return {
            turtles: undefined, // the turtles on me. Lazy evalued, see turtlesHere
        }
    }
    // Initialize a Patch given its Patches AgentSet.
    constructor() {
        Object.assign(this, Patch.defaultVariables())
    }
    // Getter for x,y derived from patch id, thus no setter.
    get x() {
        return (this.id % this.model.world.numX) + this.model.world.minX
    }
    get y() {
        return (
            this.model.world.maxY - Math.floor(this.id / this.model.world.numX)
        )
    }
    get z() {
        return 0
    }
    isOnEdge() {
        return this.patches.isOnEdge(this)
    }

    // Getter for neighbors of this patch.
    // Uses lazy evaluation to promote neighbors to instance variables.
    // To avoid promotion, use `patches.neighbors(this)`.
    // Promotion makes getters accessed only once.
    // defineProperty required: can't set this.neighbors when getter defined.
    get neighbors() {
        // lazy promote neighbors from getter to instance prop.
        const n = this.patches.neighbors(this)
        Object.defineProperty(this, 'neighbors', { value: n, enumerable: true })
        return n
    }
    get neighbors4() {
        const n = this.patches.neighbors4(this)
        Object.defineProperty(this, 'neighbors4', {
            value: n,
            enumerable: true,
        })
        return n
    }

    // Promote this.turtles on first call to turtlesHere.
    turtlesHere() {
        if (this.turtles == null) {
            this.patches.ask(p => {
                p.turtles = new AgentArray() // []
            })
            this.model.turtles.ask(t => {
                t.patch.turtles.push(t)
            })
        }
        return this.turtles
    }
    // Returns above but returning only turtles of this breed.
    breedsHere(breed) {
        const turtles = this.turtlesHere()
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

    // Return angle in radians towards agent/x,y
    // Use util.angleToHeading to convert to heading
    towards(agent) {
        return this.towardsXY(agent.x, agent.y)
    }
    towardsXY(x, y) {
        return util.radiansToward(this.x, this.y, x, y)
    }
    // Return patch w/ given parameters. Return undefined if off-world.
    // Return patch dx, dy from my position.
    patchAt(dx, dy) {
        return this.patches.patch(this.x + dx, this.y + dy)
    }
    patchAtAngleAndDistance(angle, distance) {
        return this.patches.patchAtAngleAndDistance(this, angle, distance)
    }

    sprout(num = 1, breed = this.model.turtles, initFcn = turtle => {}) {
        return breed.create(num, turtle => {
            turtle.setxy(this.x, this.y)
            initFcn(turtle)
        })
    }
}

// export default Patch
