import * as util from './utils.js'
import AgentArray from './AgentArray.js'

// Class Link instances form a link between two turtles, forming a graph.
// Flyweight object creation, see Patch/Patches.
// https://medium.com/dailyjs/two-headed-es6-classes-fe369c50b24
/**
 * Class Link instances form a link between two {@link Turtle}s, forming a graph
 * with the Turtles being the nodes, and the Links the edges.
 *
 * You do not call `new Link()`, instead class Links creates Link instances
 * via {@link Links#create} or  {@link Links#createOne}
 *
 * I.e. class Turtles is a factory for all of it's Turtle instances.
 * So *don't* do this:
 */
class Link {
    hidden = false
    end0 = null // Turtles: end0 & 1 are turtle ends of the link
    end1 = null
    width = 1 // THREE: must be 1. Canvas2D (unsupported) has widths.

    // Set by AgentSet
    agentSet
    model
    name

    init(from, to) {
        this.end0 = from
        this.end1 = to
        from.links.push(this)
        to.links.push(this)
    }
    // Remove this link from its agentset
    die() {
        if (this.id === -1) return
        this.agentSet.removeAgent(this)
        util.removeArrayItem(this.end0.links, this)
        util.removeArrayItem(this.end1.links, this)
        // Set id to -1, indicates that I've died.
        this.id = -1
    }
    isDead() {
        return this.id === -1
    }

    bothEnds() {
        return AgentArray.fromArray([this.end0, this.end1])
    }
    length() {
        return this.end0.distance(this.end1)
    }
    // use getter, all the other headings are getters
    get heading() {
        const { x0, x1, y0, y1 } = this
        const rads = Math.atan2(y1 - y0, x1 - x0)
        return this.model.fromRads(rads)
    }
    otherEnd(turtle) {
        if (turtle === this.end0) return this.end1
        if (turtle === this.end1) return this.end0
        throw Error(`Link.otherEnd: turtle not a link turtle: ${turtle}`)
    }
    distanceXY(x, y) {
        return (
            this.bothEnds()
                .map(t => t.distanceXY(x, y))
                .sum() - this.length()
        )
    }

    get x0() {
        return this.end0.x
    }
    get y0() {
        return this.end0.y
    }
    get z0() {
        return this.end0.z ? this.end0.z : 0 // REMIND: move to turtles
    }
    get x1() {
        return this.end1.x
    }
    get y1() {
        return this.end1.y
    }
    get z1() {
        return this.end1.z ? this.end1.z : 0
    }
}

export default Link
