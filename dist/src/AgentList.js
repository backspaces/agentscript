import * as util from './utils.js'
import AgentArray from './AgentArray.js'

export default class AgentList extends AgentArray {
    // /**
    //  * Magic to return AgentArrays rather than AgentList
    //  * [Symbol.species](https://goo.gl/Zsxwxd)
    //  *
    //  * @readonly
    //  */
    // static get [Symbol.species]() {
    //     return AgentArray
    // }

    constructor(model, ...args) {
        if (!model) throw Error('AgentList requires model')
        super(...args)
        this.model = model
    }

    // Geometry methods for patches, turtles, and other AgentArrays which have x,y.
    // Return all agents within rect, radius, cone from given agent o.
    // If meToo, include given object, default excludes it
    // Typically the AgentArray is a subset of larger sets, reducing
    // the size, then uses these inRect, inRadius or inCone methods

    // Return all agents within rectangle from given agent o.
    // dx & dy are (float) half width/height of rect
    inRect(o, dx, dy = dx, meToo = false) {
        const agents = new AgentList(this.model)
        const minX = o.x - dx // ok if max/min off-world, o, a are in-world
        const maxX = o.x + dx
        const minY = o.y - dy
        const maxY = o.y + dy
        this.ask(a => {
            if (minX <= a.x && a.x <= maxX && minY <= a.y && a.y <= maxY) {
                if (meToo || o !== a) agents.push(a)
            }
        })
        return agents
    }

    // Return all agents in AgentArray within d distance from given object.
    inRadius(o, radius, meToo = false) {
        const agents = new AgentList(this.model)
        // const {x, y} = o // perf?
        const d2 = radius * radius
        const sqDistance = util.sqDistance // Local function 2-3x faster, inlined?
        this.ask(a => {
            if (sqDistance(o.x, o.y, a.x, a.y) <= d2) {
                if (meToo || o !== a) agents.push(a)
            }
        })
        return agents
    }

    // As above, but also limited to the angle `coneAngle` around
    // a `angle` from object `o`. coneAngle and direction in radians.
    inCone(o, radius, coneAngle, heading, meToo = false) {
        heading = this.model.toRads(heading)
        coneAngle = this.model.toAngleRads(coneAngle)

        const agents = new AgentList(this.model)
        this.ask(a => {
            if (util.inCone(a.x, a.y, radius, coneAngle, heading, o.x, o.y)) {
                if (meToo || o !== a) agents.push(a)
            }
        })
        return agents
    }
}
