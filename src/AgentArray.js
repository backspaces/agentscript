import * as util from './utils.js'

/**
 * Subclass of Array with convenience methods used by NetLogo.
 * Tipically the items in the array are Objects but can be any type.
 */
class AgentArray extends Array {
    /**
     * Magic to return AgentArrays rather than AgentList
     * or other AgentArray subclasses when using AA methods
     * [Symbol.species](https://goo.gl/Zsxwxd)
     *
     * @readonly
     */
    static get [Symbol.species]() {
        return AgentArray
    }

    /**
     * Convert an existing Array to an AgentArray "in place".
     * Use array.slice() if a new array is wanted
     *
     * @param {Array} array Array to convert to AgentArray
     * @returns {AgentArray} array converted to AgentArray
     */
    static fromArray(array) {
        const aarray = Object.setPrototypeOf(array, AgentArray.prototype)
        return aarray
    }

    /**
     * Creates an instance of AgentArray. Simply pass-through to super()
     * now, but may add initialization code later.
     * @param {*} args Zero or more items in Array
     * @example
     * let aa = new AgentArray({x:0,y:0}, {x:0,y:1}, {x:1,y:0})
     *  //=>  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }]
     */
    constructor(...args) {
        super(...args)
        // maybe do some initialization later
    }

    /**
     * See {@link World} and [MyClass's foo property]{@link World#bboxTransform}.
     * Convert this AgentArray to Array in-place
     *
     * @returns {Array} This AgentArray converted to Array
     */
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

    /**
     * Return true if there are no items in this Array
     *
     * @returns {boolean}
     * @example
     *  new AgentArray().isEmpty()
     *  //=> true
     * @example
     *  aa.isEmpty()
     *  //=> false
     */
    isEmpty() {
        return this.length === 0
    }
    /**
     * Return first item in this array. Returns undefined if empty.
     *
     * @returns {any}
     * @example
     *  aa.first()
     *  //=> { x: 0, y: 0 }
     */
    first() {
        return this[0]
    }
    /**
     * Return last item in this array. Returns undefined if empty.
     *
     * @returns {any}
     * @example
     *  aa.last()
     *  //=>  { x: 1, y: 0 }
     */
    last() {
        return this[this.length - 1]
    }
    /**
     * Return at index. Returns undefined if empty.
     * Wrap the index to be within the array.
     *
     * @returns {any}
     * @example
     *  aa.atIndex(aa.length)
     *  //=>  { x: 0, y: 0 }
     */
    atIndex(i) {
        if (this.length === 0) return undefined
        const index = util.mod(i, this.length)
        return this[index]
    }

    /**
     * Return true if fcn(element) returns true for each element in this array.
     * Same as Array.every, using NetLogo's name
     *
     * @param {Function} fcn fcn(element) return boolean
     * @returns {boolean} true if fcn returns true for all elements
     */
    all(fcn) {
        return this.every(fcn)
    }

    /**
     * Return array of property values from this array's objects.
     * Array type is specified, defaults to AgentArray
     *
     * @param {String} key Property name
     * @param {Array} [type=AgentArray] Type of array (Array, Uint8Array, ...)
     * @returns {Array} Array of given type
     * @example
     *  aa.props('x')
     *  //=> [0, 0, 1]
     * @example
     *  aa.props('y')
     *  //=> [0, 1, 0]
     */
    props(key, type = AgentArray) {
        const result = new type(this.length)
        for (let i = 0; i < this.length; i++) {
            result[i] = this[i][key]
        }
        return result
    }
    // Creates an OofA for several sets of props.
    // Obj is key, arrayType pairs: x: Float32Array
    // Result is this.props(key, arrayType) for each key
    /**
     * Creates an Object of Arrays, one Array per each property in obj.
     * Obj is key, arrayType pairs: x: Float32Array
     * This is advanced, used for web workers, very large data sets, and remote communication
     *
     * @param {Object} obj Object of prop, array type pairs
     * @returns {Object}
     * @example
     *  aa.typedSample({x: Uint8Array, y: Uint8Array})
     *  //=> {x: new Uint8Array([0, 0, 1]), y: new Uint8Array([0, 1, 0])}
     */
    typedSample(obj) {
        // const length = this.length
        const result = {}
        // note: use util's forLoop, does not iterate over this agent array.
        util.forLoop(obj, (val, key) => {
            result[key] = this.props(key, val)
        })
        return result
    }

    // Return AgentArray of results of the function fcn
    // Similar to "props" but can return computation over all keys
    // Odd: as.props('type') twice as fast as as.results(p => p.type)?
    // results(fcn) {
    //     const result = new AgentArray(this.length)
    //     for (let i = 0; i < this.length; i++) {
    //         result[i] = fcn(this[i])
    //     }
    //     return result
    // }

    /**
     * Return new AgentArray of the unique values of this array
     *
     * @returns {AgentArray}
     */
    uniq() {
        // return AgentArray.fromArray(Array.from(new Set(this)))
        return AgentArray.from(new Set(this))
    }

    /**
     * Call fcn(agent, index, array) for each item in AgentArray.
     * Index & array optional.
     * Array assumed not mutable.
     * Note: 5x+ faster than this.forEach(fcn)
     *
     * @param {Function} fcn fcn(agent, [index], [array])
     * @returns {this} Return this for chaining.
     */
    forLoop(fcn) {
        for (let i = 0, len = this.length; i < len; i++) {
            fcn(this[i], i, this)
        }
        return this
    }

    /**
     * Call fcn(agent, [ i, AgentArray ]) for each agent in AgentArray.
     * where i = agent's array index and AgentArray is this array
     * Array can shrink. If it grows, will not visit beyond original length.
     * If it either shrinks or grows, it will console.log a message
     * "ask" is NetLogo term.
     *
     * @param {Function} fcn fcn(agent, [index], [array])
     */
    ask(fcn) {
        const length = this.length
        // for (let i = 0; i < length || i < this.length; i++) {
        for (let i = 0; i < Math.min(length, this.length); i++) {
            fcn(this[i], i, this)
        }
        if (length != this.length) {
            const name = this.name || this.constructor.name
            const direction = this.length < length ? 'decreasing' : 'increasing'
            util.warn(`AgentArray.ask array mutation: ${name}: ${direction}`)
        }
        // return this
    }
    /**
     * Return all elements returning f(obj, [index, array]) true, as in ask()
     * NetLogo term, simply calls this.filter(fcn)
     *
     * @param {Function} fcn fcn(agent, [index], [array])
     * @returns {AgentArray}
     * @description
     * Use: turtles.with(t => t.foo > 20).ask(t => t.bar = true)
     */
    with(fcn) {
        return this.filter(fcn)
    }
    // Return all other than me.
    other(t) {
        return this.filter(o => o !== t)
    }
    // Return an AgentArray of values for each object in AgentArray
    //
    // If fcn is a string, it will return that property value.
    // Otherwise it returns the value returned from fcn(obj)
    getValues(fcn) {
        const props = new AgentArray()
        if (util.isString(fcn)) {
            this.forLoop(obj => props.push(obj[fcn]))
        } else {
            this.forLoop(obj => props.push(fcn(obj)))
        }
        return props
    }

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
    extent(key) {
        return [this.min(key), this.max(key)]
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

    /**
     * Create copy of this AgentArray
     * @returns AgentArray
     */
    clone() {
        return this.slice(0) // Returns an AgentArray rather than Array!
    }
    // Randomize the AgentArray in place. Use clone first if new AgentArray needed.
    // Return "this" for chaining.
    shuffle() {
        return util.shuffle(this)
    }
    // Return this AgentArray sorted by the reporter in ascending/descending order.
    // If reporter is a string, convert to a fcn returning that property.
    // Use clone if you don't want to mutate this array.
    /**
     * Return this AgentArray sorted by the reporter in ascending/descending order.
     * If reporter is a string, convert to a fcn returning that property.
     *
     * @param {function} reporter
     * @param {boolean} [ascending=true]
     * @returns {AgentArray}
     */
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
    sortedIndex(item, f = util.identityFcn) {
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
        return this.clone().remove(item).shuffle().slice(0, n)
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
                ;[o, val] = [a, aval]
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
        return min ? as.slice(0, n) : as.slice(as.length - n)
    }
    minNOf(n, reporter) {
        return this.minOrMaxNOf(true, n, reporter)
    }
    maxNOf(n, reporter) {
        return this.minOrMaxNOf(false, n, reporter)
    }
}

// // Return shallow copy of a portion of this AgentArray
// // [See Array.slice](https://goo.gl/Ilgsok)
// // Default is to clone entire AgentArray
// cloneRange(begin = 0, end = this.length) {
//     return this.slice(begin, end) // Returns an AgentArray rather than Array!
// }

export default AgentArray
