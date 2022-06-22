import * as util from './utils.js'
// import AgentArray from './AgentArray.js'
import AgentList from './AgentList.js'
import AgentSet from './AgentSet.js'

/**
 * A {@link Turtle} is an object living on the {@link Patches} world.
 * Their coordinates are floats, unlike Patches with integer coordinates.
 * They can morph between types of turtles (breeds) and storee information,
 * both within themselves but also on Patches and Links.
 *
 * The Turtles (plural) array, (AgentSet) is a collection of Turtle objects
 * that the Turtles array creates and manages.
 *
 * You do not create either individual Turtle objects, the Turtles array does.
 * You also do not create the Turtles array, class {@link Model} does.
 *
 * You use both, however, using the methods they both provide.
 *
 * @param {Model} model The model I belong to
 * @param {Turtle|Turtle3d} AgentClass The Turtle class
 * @param {string} name The name of this new Turtles instance
 * @param {null|Turtles} [baseSet=null] Used to create a breed subclass
 */
class Turtles extends AgentSet {
    constructor(model, AgentClass, name, baseSet = null) {
        super(model, AgentClass, name, baseSet)
    }

    /**
     * Create a single Turtle, adding it to this Turtles array.
     * The init function is called to initialize the new Turtle.
     * Returns the new Turtle.
     *
     * @param {Function} [initFcn=turtle => {}]
     * @returns {Turtle} The newly created Turtle
     */
    createOne(initFcn = turtle => {}) {
        const turtle = this.addAgent()
        // NetLogo docs: Creates number new turtles at the origin.
        // New turtles have random integer headings
        // turtle.theta = util.randomFloat(Math.PI * 2)
        turtle.heading = this.model.fromRads(util.randomFloat(Math.PI * 2))
        const p = turtle.patch
        if (p.turtles != null) {
            p.turtles.push(turtle)
        }
        initFcn(turtle)
        return turtle
    }
    /**
     * Create num Turtles, adding them to this Turtles array.
     * The init function is called to initialize each new Turtle.
     * Returns an array of the new Turtles
     *
     * @param {number} number Number of Turtles to create
     * @param {Function} [initFcn=turtle => {}] A function to initialize new turtles.
     * @returns {Array} The newly created Turtles
     */
    create(num, initFcn = turtle => {}) {
        return util.repeat(num, (i, a) => {
            a.push(this.createOne(initFcn))
        })
    }

    /**
     * Return the closest turtle within radius distance of x,y.
     * Return null if no turtles within radius.
     * If I am a breed, return the closest fellow breed.
     *
     * @param {number} x X coordinate
     * @param {number} y Y coordinate
     * @param {number} radius Radius in patches units
     * @returns {Turtle} The closest Turtle
     */
    closestTurtle(x, y, radius) {
        const ts = this.inPatchRectXY(x, y, radius)
        if (ts.length === 0) return null
        return ts.minOneOf(t => t.distanceXY(x, y))
        //pDisk.minOneOf(t => t.dist)
    }

    /**
     * Return an array of Turtles within the array of patchs.
     * If I am a breed, return only the Turtles of my breed.
     *
     * @param {Patch[]} patches Array of patches
     * @returns {AgentList} The turtles withn the Patches array.
     */
    inPatches(patches) {
        let array = new AgentList(this.model)
        for (const p of patches) array.push(...p.turtlesHere)
        // REMIND: can't use withBreed .. its not an AgentSet. Move to AgentArray?
        if (this.isBreedSet()) array = array.filter(a => a.agentSet === this)
        return array
    }

    /**
     * Return an array of Turtles within the dx,dy patchRect centered on turtle.
     * If I am a breed, return only the Turtles of my breed.
     *
     * @param {Turtle} turtle The Turtle at the patchRect center.
     * @param {number} dx The integer x radius of the patchRect
     * @param {number} [dy=dx] The integer y radius of the patchRect
     * @param {boolean} [meToo=false] Whether or not to return me as well
     * @returns {AgentList} The turtles within the patchRect
     */
    inPatchRect(turtle, dx, dy = dx, meToo = false) {
        const agents = this.inPatchRectXY(turtle.x, turtle.y, dx, dy)
        if (!meToo) util.removeArrayItem(agents, turtle)
        return agents
    }
    /**
     * Return an array of Turtles within the dx,dy patchRect centered on x,y.
     * If I am a breed, return only the Turtles of my breed.
     *
     * @param {number} x the patchRect center's integer x value
     * @param {number} y the patchRect center's integer y value
     * @param {number} dx The integer x radius of the patchRect
     * @param {number} [dy=dx] The integer y radius of the patchRect
     * @param {boolean} [meToo=false] Whether or not to return me as well
     * @returns {AgentList} The turtles within the patchRect
     */
    inPatchRectXY(x, y, dx, dy = dx) {
        const patches = this.model.patches.patchRectXY(x, y, dx, dy, true)
        return this.inPatches(patches)
    }

    /**
     * Return all the Turtles within radius of me.
     * If I am a breed, return only fellow breeds.
     *
     * @param {Turtle} turtle
     * @param {number} radius
     * @param {boolean} [meToo=false] Whether or not to return me as well
     * @returns {AgentList} The turtles within radius of me
     */
    inRadius(turtle, radius, meToo = false) {
        const agents = this.inPatchRect(turtle, radius, radius, true)
        return agents.inRadius(turtle, radius, meToo)
    }
    /**
     * Return all the Turtles with a cone of me.
     * The cone is coneAngle wide, centered on my heading.
     * If I am a breed, return only fellow breeds.
     *
     * @param {Turtle} turtle
     * @param {number} radius
     * @param {boolean} [meToo=false] Whether or not to return me as well
     * @returns {AgentList} The turtles within the cone.
     */
    inCone(turtle, radius, coneAngle, meToo = false) {
        const agents = this.inPatchRect(turtle, radius, radius, true)
        return agents.inCone(turtle, radius, coneAngle, turtle.heading, meToo)
    }

    /**
     * Position the Turtles in this breed in an equally spaced circle
     * of the given center and radius.
     * The turtle headings will be away from the center.
     *
     * @param {number} [radius=this.model.world.maxX * 0.9] The circle's radius
     * @param {Array} [center=[0, 0]] An x,y array
     */
    layoutCircle(radius = this.model.world.maxX * 0.9, center = [0, 0]) {
        const startAngle = Math.PI / 2 // up
        const direction = -1 // Clockwise
        const dTheta = (2 * Math.PI) / this.length
        const [x0, y0] = center
        this.ask((turtle, i) => {
            turtle.setxy(x0, y0)
            turtle.theta = startAngle + direction * dTheta * i
            turtle.forward(radius)
        })
    }
}

// export default Turtles
export default Turtles
