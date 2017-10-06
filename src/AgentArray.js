import util from './util.js'

// An Array superclass with convenience methods used by NetLogo.
// Tipically the items in the array are Objects, NetLogo Agents,
// but generally useful as an ArrayPlus

class AgentArray extends Array {
  // Convert an Array to an AgentArray "in place".
  // Use array.slice() if a new array is wanted
  static fromArray (array) {
    Object.setPrototypeOf(array, AgentArray.prototype)
    return array
  }

  // constructor not needed, JS passes on if ctor same as super's
  // constructor () { super() }

  // Convert between AgentArrays and Arrays
  toArray () { Object.setPrototypeOf(this, Array.prototype); return this }

  // Remove/Insert object "o" from this array. If prop given, assume
  // array sorted by prop and use binary search. Return this for chaining.
  // REMIND: Move util functions here, hopefully simplifying.
  remove (o, prop) {
    util.removeItem(this, o, prop)
    return this
  }
  insert (o, prop) {
    util.insertItem(this, o, prop)
    return this
  }

  // Return true if there are no items in this set, false if not empty.
  empty () { return this.length === 0 }
  // Return !empty()
  any () { return this.length !== 0 }
  // Return first item in this array. Returns undefined if empty.
  first () { return this[ 0 ] }
  // Return last item in this array. Returns undefined if empty.
  last () { return this[ this.length - 1 ] }
  // Return true if reporter true for all of this set's objects
  all (reporter) { return this.every(reporter) }
  // Return AgentArray of property values for key from this array's objects
  // props (key) { return this.map((a) => a[key]).toArray() }
  props (key) { return this.map((a) => a[key]) }
  // Return AgentArray with reporter(agent) true
  with (reporter) { return this.filter(reporter) }
  // Call fcn(agent) for each agent in AgentArray.
  // Return the AgentArray for chaining.
  // Note: 5x+ faster than this.forEach(fcn) !!
  ask (fcn) { for (let i = 0; i < this.length; i++) fcn(this[i], i); return this }
  // Return count of agents with reporter(agent) true
  count (reporter) {
    return this.reduce((prev, o) => prev + (reporter(o) ? 1 : 0), 0)
  }

  // Replacements for array methods to avoid calling AgentArray ctor

  // Return shallow copy of a portion of this AgentArray
  // [See Array.slice](https://goo.gl/Ilgsok)
  // Default is to clone entire AgentArray
  clone (begin = 0, end = this.length) {
    return this.slice(begin, end) // Returns an AgentArray rather than Array!
  }
  // Randomize the AgentArray in place. Use clone first if new AgentArray needed.
  // Return "this" for chaining.
  shuffle () { return util.shuffle(this) }
  // Return this AgentArray sorted by the reporter in ascending/descending order.
  // If reporter is a string, convert to a fcn returning that property.
  // Use clone if you don't want to mutate this array.
  sortBy (reporter, ascending = true) {
    util.sortObjs(this, reporter, ascending)
    return this
  }

  // Return a random agent. Return undefined if empty.
  oneOf () { return util.oneOf(this) }
  // Return a random agent, not equal to agent
  otherOneOf (agent) { return util.otherOneOf(this, agent) }
  // otherOneOf: nOf good enough?
  // Return the first agent having the min/max of given value of f(agent).
  // If reporter is a string, convert to a fcn returning that property
  minOrMaxOf (min, reporter) {
    if (this.empty()) throw Error('min/max OneOf: empty array')
    if (typeof reporter === 'string') reporter = util.propFcn(reporter)
    let o = null
    let val = min ? Infinity : -Infinity
    for (let i = 0; i < this.length; i++) {
      const a = this[i]
      const aval = reporter(a)
      if ((min && (aval < val)) || (!min && (aval > val)))
        [o, val] = [a, aval]
    }
    return o
  }
  // The min version of the above
  minOneOf (reporter) { return this.minOrMaxOf(true, reporter) }
  // The max version of the above
  maxOneOf (reporter) { return this.minOrMaxOf(false, reporter) }

  // Return n random agents as AgentArray.
  // See [Fisher-Yates-Knuth shuffle](https://goo.gl/fWNFf)
  // for better approach for large n.
  nOf (n) {
    if (n > this.length)
      throw Error('nOf: n larger than AgentArray')
    if (n === this.length) return this
    const result = new AgentArray()
    while (result.length < n) {
      const o = this.oneOf()
      if (!(o in result)) result.push(o)
    }
    return result
  }
  // Return a new AgentArray of the n min/max agents of the value of reporter,
  // in ascending order.
  // If reporter is a string, convert to a fcn returning that property
  // NOTE: we do not manage ties, see NetLogo docs.
  minOrMaxNOf (min, n, reporter) {
    if (n > this.length) throw Error('min/max nOf: n larger than AgentArray')
    const as = this.clone().sortBy(reporter)
    return min ? as.clone(0, n) : as.clone(as.length - n)
  }
  minNOf (n, reporter) { return this.minOrMaxNOf(true, n, reporter) }
  maxNOf (n, reporter) { return this.minOrMaxNOf(false, n, reporter) }

  // Geometry methods for patches, turtles, and other AgentArrays which have x,y.
  // Return all agents within rect, radius, cone from given agent o.
  // If meToo, include given object, default excludes it
  // Typically the AgentArray is a subset of larger sets, reducing
  // the size, then uses these inRect, inRadius or inCone methods

  // Return all agents within rectangle from given agent o.
  // dx & dy are (float) half width/height of rect
  inRect (o, dx, dy = dx, meToo = false) {
    const agents = new AgentArray()
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
  inRadius (o, radius, meToo = false) {
    const agents = new AgentArray()
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
  // a `direction` from object `o`.
  inCone (o, radius, coneAngle, direction, meToo = false) {
    const agents = new AgentArray()
    this.ask(a => {
      if (util.inCone(a.x, a.y, radius, coneAngle, direction, o.x, o.y)) {
        if (meToo || o !== a) agents.push(a)
      }
    })
    return agents
  }
}

export default AgentArray
