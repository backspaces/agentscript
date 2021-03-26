import * as util from './utils.js'
// import AgentArray from './AgentArray.js'
import AgentList from './AgentList.js'
import AgentSet from './AgentSet.js'

// Turtles are the world other agentsets live on. They create a coord system
// from Model's world values: size, minX, maxX, minY, maxY
/**
 * Turtles are objects living on the {@link Patches} world.
 * Their coordinates are floats, unlike Patches with integer coordinates.
 *
 * @extends {AgentSet}
 */
export default class Turtles extends AgentSet {
    // Factories:
    // Add 1 or more turtles.
    // Can be a single turtle or an array of turtles. The optional init
    // proc is called on the new link after inserting in the agentSet.

    // Return a single turtle
    createOne(initFcn = turtle => {}) {
        const turtle = this.addAgent()
        // NetLogo docs: Creates number new turtles at the origin.
        // New turtles have random integer headings
        // turtle.theta = util.randomFloat(Math.PI * 2)
        turtle.heading = this.model.fromRads(util.randomFloat(Math.PI * 2))
        initFcn(turtle)
        return turtle
    }
    // Create num turtles, returning an array.
    // If num == 1, return array with single turtle
    create(num, initFcn = turtle => {}) {
        return util.repeat(num, (i, a) => {
            a.push(this.createOne(initFcn))
        })
    }

    // Return the closest turtle within radius distance of x,y
    // Return null if no turtles within radius
    closestTurtle(x, y, radius) {
        const ts = this.inPatchRectXY(x, y, radius)
        if (ts.length === 0) return null
        return ts.minOneOf(t => t.distanceXY(x, y))
        //pDisk.minOneOf(t => t.dist)
    }

    /**
     * Return an array of this breed within the array of patchs
     *
     * @param {Patch[]} patches Array of patches
     * @returns {AgentList}
     */
    inPatches(patches) {
        // let array = new AgentArray()
        let array = new AgentList(this.model)
        for (const p of patches) array.push(...p.turtlesHere())
        // REMIND: can't use withBreed .. its not an AgentSet. Move to AgentArray?
        if (this.isBreedSet()) array = array.filter(a => a.agentSet === this)
        return array
    }

    // Return an array of turtles/breeds within the patchRect, dx/y integers
    // Note: will return turtle too. Also slightly inaccurate due to being
    // patch based, not turtle based.
    inPatchRect(turtle, dx, dy = dx, meToo = false) {
        // meToo: true for patches, could have several turtles on patch
        // const patches = this.model.patches.inRect(turtle.patch, dx, dy, true)
        // const agents = this.inPatches(patches)
        const agents = this.inPatchRectXY(turtle.x, turtle.y, dx, dy)
        // don't use agents.removeAgent: breeds
        if (!meToo) util.removeArrayItem(agents, turtle)
        // if (!meToo) util.removeItem(agents, turtle)
        return agents // this.inPatches(patches)
        // return this.inPatchRect(turtle.x, turtle.y, dx, dy, meToo)
    }
    inPatchRectXY(x, y, dx, dy = dx) {
        const patches = this.model.patches.patchRectXY(x, y, dx, dy, true)
        return this.inPatches(patches)
    }

    // Return the members of this agentset that are within radius distance
    // from me, using a patch rect.
    // inRadiusXY(x, y, radius, meToo = false) {
    //     const agents = this.inPatchRectXY(x, y, radius)
    //     return agents.inRadius(turtle, radius, meToo)
    // }
    inRadius(turtle, radius, meToo = false) {
        const agents = this.inPatchRect(turtle, radius, radius, true)
        return agents.inRadius(turtle, radius, meToo)
    }
    inCone(turtle, radius, coneAngle, meToo = false) {
        const agents = this.inPatchRect(turtle, radius, radius, true)
        // const direction = this.model.toRads(turtle.direction)
        // coneAngle = this.model.toRads(direction)
        // coneAngle = this.model.toAngleRads(coneAngle)
        // Calls AgentArray's radian based method
        // return agents.inCone(turtle, radius, coneAngle, turtle.theta, meToo)
        return agents.inCone(turtle, radius, coneAngle, turtle.heading, meToo)
    }

    // Circle Layout: position the turtles in this breed in an equally
    // spaced circle of the given center and radius
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
