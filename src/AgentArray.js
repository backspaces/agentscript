import util from './util.js'

// An Array superclass with convenience methods used by NetLogo.
// Tipically the items in the array are Objects, NetLogo Agents,
// but generally useful as an ArrayPlus

class AgentArray extends Array {
    // Convert an Array to an AgentArray "in place".
    // Use array.slice() if a new array is wanted
    static fromArray(array) {
        Object.setPrototypeOf(array, AgentArray.prototype)
        return array
    }

    // constructor not needed, JS passes on if ctor same as super's
    // constructor () { super() }

    // Convert between AgentArrays and Arrays
    toArray() {
        Object.setPrototypeOf(this, Array.prototype)
        return this
    }

    // NL: Return true if reporter true for all of this set's objects
    // Use Array.every(). Also Array.some()
    // all (reporter) { return this.every(reporter) }
    // // Return !isEmpty()
    // any () { return this.length !== 0 }
    // NL: Return AgentArray with reporter(agent) true. Use Array.filter()
    // with (reporter) { return this.filter(reporter) }

    // Return true if there are no items in this set, false if not empty.
    // NL: uses "empty", confusing. Also uses any() .. use !isEmpty()
    isEmpty() {
        return this.length === 0
    }
    // Return first item in this array. Returns undefined if empty.
    first() {
        return this[0]
    }
    // Return last item in this array. Returns undefined if empty.
    last() {
        return this[this.length - 1]
    }
    // Return AgentArray of property values for key from this array's objects
    // props (key) { return this.map((a) => a[key]).toArray() }
    props(key) {
        return this.map(a => a[key])
    }
    // Return AgentArray of values of the function fcn
    values(fcn) {
        return this.map(a => fcn(a))
    }
    // Returns AgentArray of unique elements in this *sorted* AgentArray.
    // Use sortBy or clone & sortBy if needed.
    uniq(f = util.identity) {
        if (util.isString(f)) f = o => o[f]
        return this.filter((ai, i, a) => i === 0 || f(ai) !== f(a[i - 1]))
    }
    // Call fcn(agent, index, array) for each agent in AgentArray.
    // Return the AgentArray for chaining.
    // Note: 5x+ faster than this.forEach(fcn) !!
    // each(fcn) {
    //     for (let i = 0, len = this.length; i < len; i++) {
    //         fcn(this[i], i, this)
    //     }
    //     return this
    // }

    // Call fcn(agent, index, array) for each item in AgentArray.
    // Return the AgentArray for chaining.
    // Note: 5x+ faster than this.forEach(fcn) !!
    // Warns on array mutation (length change)
    ask(fcn) {
        const length = this.length
        for (let i = 0; i < this.length; i++) {
            fcn(this[i], i, this)
            if (length != this.length) {
                const name = this.name || this.constructor.name
                const direction =
                    this.length < length ? 'decreasing' : 'increasing'
                util.warn(
                    `AgentArray.ask array mutation: ${name}: ${direction}`
                )
            }
        }
        return this
    }
    // ask(fcn) {
    //     if (this.length === 0) return
    //     const lastID = this.last().id
    //     let obj = this[0]
    //     for (let i = 0; obj && obj.id <= lastID; i++) {
    //         // const lastObj = obj
    //         fcn(obj, i, this)
    //         obj = this[i++]
    //         // if (!obj || obj === lastObj) continue
    //         // if (!obj || obj === lastObj) continue
    //     }
    //     return this
    // }

    // Return count of agents with reporter(agent) true
    count(reporter) {
        return this.reduce((prev, o) => prev + (reporter(o) ? 1 : 0), 0)
    }

    sum(key) {
        return this.reduce((prev, o) => prev + (key ? o[key] : o), 0)
    }
    avg(key) {
        return this.sum(key) / this.length
    }
    min(key) {
        return this.reduce(
            (prev, o) => Math.min(prev, key ? o[key] : o),
            Infinity
        )
    }
    max(key) {
        return this.reduce(
            (prev, o) => Math.max(prev, key ? o[key] : o),
            -Infinity
        )
    }
    histogram(key, bins = 10, min = this.min(key), max = this.max(key)) {
        const binSize = (max - min) / bins
        const aa = new AgentArray(bins)
        aa.fill(0)
        this.ask(a => {
            const val = key ? a[key] : a
            if (val < min || val > max) {
                util.warn(`histogram bounds error: ${val}: ${min}-${max}`)
            } else {
                let bin = Math.floor((val - min) / binSize)
                if (bin === bins) bin-- // val is max, round down
                aa[bin]++
            }
        })
        // Object.assign(aa, {bins, min, max, binSize, key})
        aa.parameters = { key, bins, min, max, binSize, arraySize: this.length }
        // console.log(key, bins, min, max, binSize, aa)
        return aa
    }

    // Return shallow copy of a portion of this AgentArray
    // [See Array.slice](https://goo.gl/Ilgsok)
    // Default is to clone entire AgentArray
    clone(begin = 0, end = this.length) {
        return this.slice(begin, end) // Returns an AgentArray rather than Array!
    }
    // Randomize the AgentArray in place. Use clone first if new AgentArray needed.
    // Return "this" for chaining.
    shuffle() {
        return util.shuffle(this)
    }
    // Return this AgentArray sorted by the reporter in ascending/descending order.
    // If reporter is a string, convert to a fcn returning that property.
    // Use clone if you don't want to mutate this array.
    sortBy(reporter, ascending = true) {
        util.sortObjs(this, reporter, ascending)
        return this
    }

    // Remove an item from an array. Binary search if f given
    // Array unchanged if item not found.
    remove(o, f) {
        const i = this.agentIndex(o, f)
        if (i !== -1) this.splice(i, 1)
        else util.warn(`remove: ${o} not in AgentArray`)
        return this // chaining
    }
    insert(o, f) {
        const i = this.sortedIndex(o, f)
        if (this[i] === o) throw Error('insert: item already in AgentArray')
        this.splice(i, 0, o) // copyWithin?
    }

    // Binary search:
    // Return array index of item, where array is sorted.
    // If item not found, return index for item for array to remain sorted.
    // f is used to return an integer for sorting, defaults to identity.
    // If f is a string, it is the object property to sort by.
    // Adapted from underscore's _.sortedIndex.
    sortedIndex(item, f = util.identity) {
        if (util.isString(f)) f = util.propFcn(f)
        const value = f(item)
        // Why not array.length - 1? Because we can insert 1 after end of array.
        // let [low, high] = [0, array.length]
        let low = 0
        let high = this.length
        while (low < high) {
            const mid = (low + high) >>> 1 // floor (low+high)/2
            if (f(this[mid]) < value) {
                low = mid + 1
            } else {
                high = mid
            }
        }
        return low
    }
    // Return index of value in array with given property or -1 if not found.
    // Binary search if property isnt null
    // Property can be string or function.
    // Use property = identity to compare objs directly.
    agentIndex(item, property) {
        if (!property) return this.indexOf(item)
        const i = this.sortedIndex(item, property)
        return this[i] === item ? i : -1
    }
    // True if item is in array. Binary search if f given
    contains(item, f) {
        return this.agentIndex(item, f) >= 0
    }

    // Return a random agent. Return undefined if empty.
    oneOf() {
        return util.oneOf(this)
    }
    // Return a random agent, not equal to agent
    otherOneOf(agent) {
        return util.otherOneOf(this, agent)
    }
    // Return n other random agents from this array
    // otherNOf (n, agent) { return util.otherNOf(n, this, agent) }
    otherNOf(n, item) {
        if (this.length < n) throw Error('AgentArray: otherNOf: length < N')
        return this.clone()
            .remove(item)
            .shuffle()
            .slice(0, n)
    }

    // Return the first agent having the min/max of given value of f(agent).
    // If reporter is a string, convert to a fcn returning that property
    minOrMaxOf(min, reporter, valueToo = false) {
        if (this.isEmpty()) throw Error('min/max OneOf: empty array')
        if (typeof reporter === 'string') reporter = util.propFcn(reporter)
        let o = null
        let val = min ? Infinity : -Infinity
        for (let i = 0; i < this.length; i++) {
            const a = this[i]
            const aval = reporter(a)
            if ((min && aval < val) || (!min && aval > val)) {
                [o, val] = [a, aval]
            }
        }
        return valueToo ? [o, val] : o
    }
    // The min version of the above
    minOneOf(reporter) {
        return this.minOrMaxOf(true, reporter)
    }
    // The max version of the above
    maxOneOf(reporter) {
        return this.minOrMaxOf(false, reporter)
    }
    // Like the pair above, but return both the object and its value in an array.
    // const [obj, value] = minValOf(...)
    minValOf(reporter) {
        return this.minOrMaxOf(true, reporter, true)
    }
    maxValOf(reporter) {
        return this.minOrMaxOf(false, reporter, true)
    }

    // Return n random agents as AgentArray.
    // See [Fisher-Yates-Knuth shuffle](https://goo.gl/fWNFf)
    // for better approach for large n.
    nOf(n) {
        if (n > this.length) throw Error('nOf: n larger than AgentArray')
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
    minOrMaxNOf(min, n, reporter) {
        if (n > this.length) {
            throw Error('min/max nOf: n larger than AgentArray')
        }
        const as = this.clone().sortBy(reporter)
        return min ? as.clone(0, n) : as.clone(as.length - n)
    }
    minNOf(n, reporter) {
        return this.minOrMaxNOf(true, n, reporter)
    }
    maxNOf(n, reporter) {
        return this.minOrMaxNOf(false, n, reporter)
    }

    // Geometry methods for patches, turtles, and other AgentArrays which have x,y.
    // Return all agents within rect, radius, cone from given agent o.
    // If meToo, include given object, default excludes it
    // Typically the AgentArray is a subset of larger sets, reducing
    // the size, then uses these inRect, inRadius or inCone methods

    // Return all agents within rectangle from given agent o.
    // dx & dy are (float) half width/height of rect
    inRect(o, dx, dy = dx, meToo = false) {
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
    inRadius(o, radius, meToo = false) {
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
    inCone(o, radius, coneAngle, direction, meToo = false) {
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
