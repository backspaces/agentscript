import AgentList from './AgentList.js'
import * as util from './utils.js'

/**
 * Class Turtle instances represent the dynamic, behavioral element of modeling.
 * Each turtle knows the patch it is on, and interacts with that and other
 * patches, as well as other turtles. Turtles are also the end points of Links.
 *
 * You do not call `new Turtle()`, instead class Turtles creates Turtle instances
 * via {@link Turtles#create} or  {@link Turtles#createOne}
 *
 * I.e. class Turtles is a factory for all of it's Turtle instances.
 * So *don't* do this:
 */

class Turtle {
    atEdge = 'wrap'
    hidden = false
    // Set by AgentSet
    agentSet
    model
    name

    // Called by Turtle factories, not programmers
    agentConstructor() {
        this.theta = null
        this.x = 0
        this.y = 0
        this.agentSet.setDefault('z', null)
    }

    /**
     * Ask this turtle to "die"
     * - Removes itself from the Turtles array
     * - Removes itself from any Turtles breeds
     * - Removes all my Links if any exist
     * - Removes me from my Patch list of turtles on it
     * - Set it's id to -1 to indicate to others it's gone
     */
    die() {
        if (this.id === -1) return
        this.agentSet.removeAgent(this) // remove me from my baseSet and breeds
        // Remove my links if any exist.
        // Careful: don't promote links
        if (this.hasOwnProperty('links')) {
            while (this.links.length > 0) this.links[0].die()
        }
        // Remove me from patch.turtles cache if patch.turtles array exists
        // if (this.patch.turtles != null) {
        //     util.removeArrayItem(this.patch.turtles, this)
        // }
        if (this.patch && this.patch.turtles)
            util.removeArrayItem(this.patch.turtles, this)

        // Set id to -1, indicates that I've died.
        // Useful when other JS objects contain turtles. Views for example.
        this.id = -1
    }
    isDead() {
        return this.id === -1
    }

    /**
     * Factory method: create num new turtles at this turtle's location.
     *
     * @param {number} [num=1] The number of new turtles to create
     * @param {AgentSet} [breed=this.agentSet] The type of turtles to create,
     * defaults to my type
     * @param {Function} [init=turtle => {}] A function to initialize the new
     * turtles, defaults to no-op
     * @returns {Array} An Array of the new Turtles, generally ignored
     * due to the init function
     */
    hatch(num = 1, breed = this.agentSet, init = turtle => {}) {
        return breed.create(num, turtle => {
            // turtle.setxy(this.x, this.y)
            turtle.setxy(this.x, this.y, this.z)
            turtle.theta = this.theta
            // hatched turtle inherits parents' ownVariables
            for (const key of breed.ownVariables) {
                if (turtle[key] == null) turtle[key] = this[key]
            }
            init(turtle)
        })
    }
    // Getter for links for this turtle.
    // Uses lazy evaluation to promote links to instance variables.
    /**
     * Returns an array of the Links that have this Turtle as one of the end points
     * @returns {Array} An AgentList Array of my Links
     */
    get links() {
        // lazy promote links from getter to instance prop.
        Object.defineProperty(this, 'links', {
            value: new AgentList(this.model),
            enumerable: true,
        })
        return this.links
    }
    /**
     * Return the patch this Turtle is on. Return null if Turtle off-world.
     */
    get patch() {
        return this.model.patches.patch(this.x, this.y)
    }

    /**
     * Return this Turtle's heading
     */
    get heading() {
        return this.model.fromRads(this.theta)
    }
    /**
     * Sets this Turtle's heading
     */
    set heading(heading) {
        this.theta = this.model.toRads(heading)
    }
    /**
     * Computes the difference between the my heading and the given heading,
     * the smallest angle by which t could be rotated to produce heading.
     *
     * @param {Angle} heading The heading I wish to be roated to.
     * @returns {Angle}
     */
    subtractHeading(heading) {
        // // Using rads so will work with any geometry.
        // const rads1 = this.model.toRads(this.heading)
        // const rads2 = this.model.toRads(heading)
        // const diff = util.subtractRadians(rads2, rads1)
        // return this.model.fromRads(diff)
        return util.subtractHeadings(heading, this.heading)
    }

    /**
     * Set Turtles x, y position. If z given, override default z of 0.
     *
     * @param {number} x Turtle's x coord, a Float in patch space
     * @param {number} y Turtle's Y coord, a Float in patch space
     * @param {number|undefined} [z=undefined] Turtle's Z coord if given
     */
    setxy(x, y, z = undefined) {
        const p0 = this.patch
        this.x = x
        this.y = y
        if (z != null) this.z = z

        this.checkXYZ(p0)
    }
    checkXYZ(p0) {
        this.checkEdge()
        this.checkPatch(p0)
    }
    checkEdge() {
        const { x, y, z } = this
        // if (!(this.model.world.isOnWorld(x, y, z) || this.atEdge === 'OK')) {
        if (!this.model.world.isOnWorld(x, y, z) && this.atEdge !== 'OK') {
            this.handleEdge(x, y, z)
        }
    }
    checkPatch(p0) {
        const p = this.patch
        // both can be null
        if (p != p0) {
            if (p0 && p0.turtles) util.removeArrayItem(p0.turtles, this)
            if (p && p.turtles) p.turtles.push(this)
        }
    }
    /**
     * Handle turtle x,y,z if turtle off-world.
     * Uses the Turtle's atEdge property to determine how to manage the Turtle.
     * Defaults to 'wrap', wrapping the x,y,z to the opposite edge.
     *
     * atEdge can be:
     * - 'die'
     * - 'wrap'
     * - 'bounce'
     * - 'clamp'
     * - 'random'
     * - a function called with the Turtle as it's argument
     *
     * @param {number} x Turtle's x coord
     * @param {number} y Turtle's y coord
     * @param {number|undefined} [z=undefined] Turtle's z coord if not undefined
     */
    handleEdge(x, y, z = undefined) {
        let atEdge = this.atEdge

        if (util.isString(atEdge)) {
            const { minXcor, maxXcor, minYcor, maxYcor, minZcor, maxZcor } =
                this.model.world

            if (atEdge === 'wrap') {
                this.x = util.wrap(x, minXcor, maxXcor)
                this.y = util.wrap(y, minYcor, maxYcor)
                if (z != null) this.z = util.wrap(z, minZcor, maxZcor)
            } else if (atEdge === 'die') {
                this.die()
            } else if (atEdge === 'random') {
                this.setxy(...this.model.world.randomPoint())
            } else if (atEdge === 'clamp' || atEdge === 'bounce') {
                this.x = util.clamp(x, minXcor, maxXcor)
                this.y = util.clamp(y, minYcor, maxYcor)
                if (z != null) this.z = util.clamp(z, minZcor, maxZcor)

                if (atEdge === 'bounce') {
                    if (this.x === minXcor || this.x === maxXcor) {
                        this.theta = Math.PI - this.theta
                    } else if (this.y === minYcor || this.y === maxYcor) {
                        this.theta = -this.theta
                    } else if (this.z === minZcor || this.z === maxZcor) {
                        if (this.pitch) {
                            this.pitch = -this.pitch
                        } else {
                            this.z = util.wrap(z, minZcor, maxZcor)
                        }
                    }
                }
            } else {
                throw Error(`turtle.handleEdge: bad atEdge: ${atEdge}`)
            }
        } else {
            this.atEdge(this)
        }
    }
    /**
     * Place the turtle at the given patch/turtle location
     *
     * @param {Patch|Turtle} agent A Patch or Turtle who's location is used
     */
    moveTo(agent) {
        // this.setxy(agent.x, agent.y)
        this.setxy(agent.x, agent.y, agent.z)
    }
    /**
     * Move forward, along the Turtle's heading d units in Patch coordinates
     *
     * @param {number} d The distance to move
     */
    forward(d) {
        this.setxy(
            this.x + d * Math.cos(this.theta),
            this.y + d * Math.sin(this.theta)
        )
    }

    /**
     * Change Turtle's heading by angle
     *
     * @param {number} angle The angle to rotate by
     */
    rotate(angle) {
        angle = this.model.toCCW(angle)
        this.heading += angle
    }
    /**
     * Turn Turtle right by angle
     *
     * @param {number} angle The angle to rotate by
     */
    right(angle) {
        this.rotate(-angle)
    }
    /**
     * Turn Turtle left by angle
     *
     * @param {number} angle The angle to rotate by
     */
    left(angle) {
        this.rotate(angle)
    }

    /**
     * Turn turtle so at to be facing the given Turtle or Patch
     *
     * @param {Patch|Turtle} agent The agent to face towards
     */
    face(agent) {
        // this.theta = this.towards(agent)
        this.heading = this.towards(agent)
    }
    /**
     * Turn turtle so at to be facing the given x, y patch coordinate
     *
     * @param {number} x The x coordinate
     * @param {number} y The y coordinate
     */
    facexy(x, y) {
        // this.theta = this.towardsXY(x, y)
        this.heading = this.towardsXY(x, y)
    }

    /**
     * Return the patch ahead of this turtle by distance.
     * Return undefined if the distance puts the patch off-world
     * @param {number} distance The distance ahead
     * @returns {Patch|undefined} The patch at the distance ahead of this Turtle
     */
    patchAhead(distance) {
        return this.patchAtHeadingAndDistance(this.heading, distance)
    }
    /**
     * Return the patch angle to the right and ahead by distance
     * Return undefined if the distance puts the patch off-world
     * @param {number} angle The angle to the right
     * @param {number} distance The distance ahead
     * @returns {Patch|undefined} The patch found, or undefined if off-world
     */
    patchRightAndAhead(angle, distance) {
        // if (this.model.geometry === 'heading') angle = -angle
        angle = this.model.toCCW(angle)
        return this.patchAtHeadingAndDistance(this.heading - angle, distance)
    }
    /**
     * Return the patch angle to the left and ahead by distance
     * Return undefined if the distance puts the patch off-world
     * @param {number} angle The angle to the left
     * @param {number} distance The distance ahead
     * @returns {Patch|undefined} The patch found, or undefined if off-world
     */
    patchLeftAndAhead(angle, distance) {
        return this.patchRightAndAhead(-angle, distance)
    }
    /**
     * Can I move forward by distance and not be off-world?
     * @param {number} distance The distance ahead
     * @returns {Boolean} True if moving forward by distance is on-world
     */
    canMove(distance) {
        return this.patchAhead(distance) != null
    }

    /**
     * Distance from this turtle to x, y
     * No off-world test done.
     *
     * 2.5D: use z too if both z & this.z exist.
     * @param {number} x
     * @param {number} y
     * @param {number|undefined} [z=null]
     * @returns {number} distance in patch coordinates.
     */
    distanceXY(x, y, z = null) {
        const useZ = z != null && this.z != null
        return useZ
            ? util.distance3(this.x, this.y, this.z, x, y, z)
            : util.distance(this.x, this.y, x, y)
    }
    /**
     * Return distance from me to the Patch or Turtle
     *
     * 2.5D: use z too if both agent.z and this.z exist
     * @param {Patch|Turtle} agent
     * @returns {number} distance in patch coordinates.
     */
    distance(agent) {
        const { x, y, z } = agent
        return this.distanceXY(x, y, z)
    }
    /**
     * A property for the x-increment if the turtle were to take one step
     * forward in its current heading.
     * @readonly
     */
    get dx() {
        return Math.cos(this.theta)
    }
    /**
     * A property for the y-increment if the turtle were to take one step
     * forward in its current heading.
     * @readonly
     */
    get dy() {
        return Math.sin(this.theta)
    }

    /**
     * Return the heading towards the Patch or Turtle given.
     * @param {Patch|Turtle} agent The agent who's angle from this Turtle we use
     * @returns {number} The angle towards the agent
     */
    towards(agent) {
        return this.towardsXY(agent.x, agent.y)
    }
    /**
     * Return the heading towards the given x,y coordinates.
     * @param {number} x The x coordinarte
     * @param {number} y The y coordinarte
     * @returns {number} The angle towards x,y
     */
    towardsXY(x, y) {
        // return util.radiansTowardXY(this.x, this.y, x, y)
        let rads = util.radiansTowardXY(this.x, this.y, x, y)
        // rads = this.model.toCCW(rads)
        return this.model.fromRads(rads)
    }
    /**
     * The patch at dx, dy from my current position.
     * Return undefined if off-world
     * @param {number} dx The delta x ahead
     * @param {number} dy The delta y ahead
     * @returns {Patch|undefined} The patch dx, dy ahead; undefined if off-world
     */
    patchAt(dx, dy) {
        return this.model.patches.patch(this.x + dx, this.y + dy)
    }

    /**
     * Return the patch at the absolute, not relative heading and distance
     * from this turtle. Return undefined if off-world
     *
     * Use the Left/Right versions for relative heading.
     * @param {number} heading The absolute angle from this turtle
     * @param {number} distance The distance ahead
     * @returns {Patch|undefined} The Patch, or undefined if off-world
     */
    patchAtHeadingAndDistance(heading, distance) {
        return this.model.patches.patchAtHeadingAndDistance(
            this,
            heading,
            distance
        )
    }

    /**
     * Return the other end of this link from me. Link must include me!
     *
     * See links property for all my links, if any.
     * @param {Link} l
     * @returns {Turtle} The other turtle making this Link
     */
    otherEnd(l) {
        return l.end0 === this ? l.end1 : l.end0
    }
    // Return all turtles linked to me
    /**
     * Return all turtles linked to me. Basically me.otherEnd of all my links.
     * @returns {Array} All the turtles linked to me
     */
    linkNeighbors() {
        return this.links.map(l => this.otherEnd(l))
    }
    /**
     * Is the given Turtle linked to me?
     * @param {Turtle} t
     * @returns {Boolean}
     */
    isLinkNeighbor(t) {
        return t in this.linkNeighbors()
    }
}

export default Turtle
