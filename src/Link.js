import util from './util.js'
// import Color from './Color.js'

// Class Link instances form a link between two turtles, forming a graph.
// Flyweight object creation, see Patch/Patches.
// https://medium.com/dailyjs/two-headed-es6-classes-fe369c50b24

class Link {
    // The core default variables needed by a Link.
    // Use links.setDefault(name, val) to change
    // Modelers add additional "own variables" as needed.
    static defaultVariables() {
        // Core variables for patches. Not 'own' variables.
        return {
            end0: null, // Turtles: end0 & 1 are turtle ends of the link
            end1: null,
            width: 1, // THREE: must be 1. Canvas2D (unsupported) has widths.
        }
    }
    // Initialize a Link
    constructor() {
        Object.assign(this, Link.defaultVariables())
    }
    init(from, to) {
        this.end0 = from
        this.end1 = to
        from.links.push(this)
        to.links.push(this)
    }
    // Remove this link from its agentset
    die() {
        this.agentSet.removeAgent(this)
        util.removeArrayItem(this.end0.links, this)
        util.removeArrayItem(this.end1.links, this)
        // Set id to -1, indicates that I've died.
        this.id = -1
    }

    bothEnds() {
        return [this.end0, this.end1]
    }
    length() {
        return this.end0.distance(this.end1)
    }
    otherEnd(turtle) {
        if (turtle === this.end0) return this.end1
        if (turtle === this.end1) return this.end0
        throw Error(`Link.otherEnd: turtle not a link turtle: ${turtle}`)
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
