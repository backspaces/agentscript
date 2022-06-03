import * as util from './utils.js'
import AgentArray from './AgentArray.js'

/**
 * Geometry methods for patches, turtles, and other AgentArrays
 * Return all agents within rect, radius, cone from given agent.
 * If meToo, include given object, default excludes it
 * Typically the AgentArray is a subset of larger sets, reducing
 * the size, then uses these inRect, inRadius or inCone methods
 */

class AgentList extends AgentArray {
    /**
     *
     * @param {Model} model The Model this AgentList belongs to
     * @param  {...any} args The arguments passed to super
     */
    constructor(model, ...args) {
        if (!model) throw Error('AgentList requires model')
        super(...args)
        this.model = model
    }

    /**
     * Return all agents within rectangle from given agent.
     * dx & dy are (float) half width/height of rect
     *
     * @param {Agent} agent
     * @param {number} dx
     * @param {number} dy
     * @param {boolean} meToo
     * @returns An AgentList of agents within the rect. Include agent if metoo
     */
    inRect(agent, dx, dy = dx, meToo = false) {
        const agents = new AgentList(this.model)
        const minX = agent.x - dx // ok if max/min off-world, agent, a are in-world
        const maxX = agent.x + dx
        const minY = agent.y - dy
        const maxY = agent.y + dy
        this.ask(a => {
            if (minX <= a.x && a.x <= maxX && minY <= a.y && a.y <= maxY) {
                if (meToo || agent !== a) agents.push(a)
            }
        })
        return agents
    }

    /**
     * Return all agents in AgentArray within radius from given agent.
     *
     * @param {Agent} agent
     * @param {number} radius
     * @param {boolean} meToo
     * @returns An AgentList of agents within the radius. Include agent if metoo
     */
    inRadius(agent, radius, meToo = false) {
        const agents = new AgentList(this.model)
        // const {x, y} = agent // perf?
        const d2 = radius * radius
        const sqDistance = util.sqDistance // Local function 2-3x faster, inlined?
        this.ask(a => {
            if (sqDistance(agent.x, agent.y, a.x, a.y) <= d2) {
                if (meToo || agent !== a) agents.push(a)
            }
        })
        return agents
    }

    /**
     * As above, but also limited to the angle `coneAngle` around
     * an `angle` from object `agent`. coneAngle and direction in radians.
     *
     * @param {Agent} agent
     * @param {number} radius
     * @param {number} coneAngle
     * @param {number} heading
     * @param {boolean} meToo
     * @returns An AgentList of agents within the angle. Include agent if metoo
     */
    inCone(agent, radius, coneAngle, heading, meToo = false) {
        heading = this.model.toRads(heading)
        coneAngle = this.model.toAngleRads(coneAngle)

        const agents = new AgentList(this.model)
        this.ask(a => {
            if (
                util.inCone(
                    a.x,
                    a.y,
                    radius,
                    coneAngle,
                    heading,
                    agent.x,
                    agent.y
                )
            ) {
                if (meToo || agent !== a) agents.push(a)
            }
        })
        return agents
    }
}

export default AgentList
