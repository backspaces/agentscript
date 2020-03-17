import AgentArray from './AgentArray.js'
// import util from './util.js'

// AgentSets are arrays that are factories for their own agents/objects.
// They are the base for Patches, Turtles and Links.

// Names: AgentSets are NetLogo collections: Patches, Turtles, and Links.
// Agent is an object in an AgentSet: Patch, Turtle, Link.

class AgentSet extends AgentArray {
    // Magic to return AgentArray's rather than AgentSets
    // Symbol.species: https://goo.gl/Zsxwxd
    static get [Symbol.species]() {
        return AgentArray
    }

    // Create an empty `AgentSet` and initialize the `ID` counter for add().
    // If baseSet is supplied, the new agentset is a subarray of baseSet.
    // This sub-array feature is how breeds are managed, see class `Model`
    constructor(model, AgentClass, name, baseSet = null) {
        super() // create empty AgentArray
        baseSet = baseSet || this // if not a breed, set baseSet to this
        Object.assign(this, { model, name, baseSet, AgentClass })
        // BaseSets know their breeds and keep the ID global
        if (this.isBaseSet()) {
            this.breeds = {} // will contain breedname: breed entries
            this.ID = 0
            // Breeds inherit frm their baseSet and add themselves to baseSet
        } else {
            Object.setPrototypeOf(this, Object.getPrototypeOf(baseSet))
            this.baseSet.breeds[name] = this
        }
        // Keep a list of this set's variables; see `own` below
        this.ownVariables = []
        // Create a proto for our agents by having a defaults and instance layer
        // this.AgentClass = AgentClass
        this.agentProto = new AgentClass(this)
        this.protoMixin(this.agentProto, AgentClass)
        // }
    }
    // All agents have:
    // vars: id, agentSet, model, world, breed (getter)
    //   baseSet by name: turtles/patches/links
    // methods: setBreed, getBreed, isBreed
    // getter/setter: breed
    protoMixin(agentProto, AgentClass) {
        Object.assign(agentProto, {
            agentSet: this,
            model: this.model,
            // world: this.world
        })
        agentProto[this.baseSet.name] = this.baseSet

        // if (this.isBaseSet()) {
        // Model.reset should not redefine these.
        if (!AgentClass.prototype.setBreed) {
            Object.assign(AgentClass.prototype, {
                setBreed(breed) {
                    breed.setBreed(this)
                },
                getBreed() {
                    return this.agentSet
                },
                isBreed(breed) {
                    return this.agentSet === breed
                },
            })
            Object.defineProperty(AgentClass.prototype, 'breed', {
                get: function() {
                    return this.agentSet
                },
            })
        }
    }

    // Create a subarray of this AgentSet. Example: create a people breed of turtles:
    // `people = turtles.newBreed('people')`
    newBreed(name) {
        return new AgentSet(this.model, this.AgentClass, name, this)
    }

    // Is this a baseSet or a derived "breed"
    isBreedSet() {
        return this.baseSet !== this
    }
    isBaseSet() {
        return this.baseSet === this
    }

    // Return breeds in a subset of an AgentSet.
    // Ex: patches.inRect(5).withBreed(houses)
    withBreed(breed) {
        return this.filter(a => a.agentSet === breed)
    }

    // Abstract method used by subclasses to create and add their instances.
    create() {
        console.log(`AgentSet: Abstract method called: ${this}`)
    }

    // Add an agent to the list.  Only used by agentset factory methods.
    // Adds the `id` property to all agents. Increment `ID`.
    // Returns the object for chaining. The set will be sorted by `id`.
    addAgent(o) {
        // o only for breeds adding themselves to their baseSet
        o = o || Object.create(this.agentProto) // REMIND: Simplify! Too slick.
        if (this.isBreedSet()) this.baseSet.addAgent(o)
        else o.id = this.ID++
        this.push(o)
        return o
    }
    clear() {
        // die() is an agent method. sets it's id to -1
        while (!this.isEmpty()) this.last().die()
    }
    // Remove an agent from the agentset, returning the agentset for chaining.
    // Note removeAgent(agent) different than remove(agent) which simply removes
    // the agent from it's array
    removeAgent(o) {
        // Remove me from my baseSet
        if (this.isBreedSet()) this.baseSet.remove(o, 'id')
        // Remove me from my set.
        this.remove(o, 'id')
        return this
    }

    // AgentSets often need a random color. We use a standard shared ColorMap map.
    // randomColor () { return ColorMap.Basic16.randomColor() }

    // Get/Set default values for this agentset's agents.
    // Return this for chaining
    setDefault(name, value) {
        this.agentProto[name] = value
        return this
    }
    getDefault(name) {
        return this.agentProto[name]
    }
    // Used when getter/setter's need to know if get/set default
    settingDefault(agent) {
        return agent.id == null
    }

    // Declare variables of an agent class. May deprecate if not needed.
    // `varnames` is a string of space separated names
    own(varnames) {
        // if (this.isBreedSet())
        //   this.ownVariables = util.clone(this.baseSet.ownVariables)
        for (const name of varnames.split(' ')) {
            this.setDefault(name, null)
            this.ownVariables.push(name)
        }
    }

    // Move an agent from its AgentSet/breed to be in this AgentSet/breed.
    setBreed(a) {
        // change agent a to be in this breed
        // Return if `a` is already of my breed
        if (a.agentSet === this) return
        // Remove/insert breeds (not baseSets) from their agentsets
        if (a.agentSet.isBreedSet()) a.agentSet.remove(a, 'id')
        if (this.isBreedSet()) this.insert(a, 'id')

        // Make list of `a`'s vars and my ownvars.
        const avars = a.agentSet.ownVariables
        // First remove `a`'s vars not in my ownVariables
        for (const avar of avars) {
            if (!this.ownVariables.includes(avar)) delete a[avar]
        }
        // Now add ownVariables to `a`'s vars, default to 0.
        // If ownvar already in avars, it is not modified.
        for (const ownvar of this.ownVariables) {
            if (!avars.includes(ownvar)) a[ownvar] = 0
        } // NOTE: NL uses 0, maybe we should use null?

        // Give `a` my defaults/statics
        return Object.setPrototypeOf(a, this.agentProto)
    }

    ask(fcn) {
        if (this.length === 0) return
        const lastID = this.last().id // would fail w/o 0 check above
        // for (let i = 0; this[i].id <= lastID; i++) { // nope.
        for (let i = 0; i < this.length && this[i].id <= lastID; i++) {
            fcn(this[i], i, this)
        }
    }
    // Manages immutability reasonably well.
    askSet(fcn) {
        if (this.length === 0) return
        // Patches are static
        if (this.name === 'patches') super.forLoop(fcn)
        else if (this.isBaseSet()) this.baseSetAsk(fcn)
        else if (this.isBreedSet()) this.cloneAsk(fcn)
    }
    // // Above, returning array for chaining
    // askSet(fcn) {
    //     if (this.length === 0) return this
    //     // Patches are static
    //     if (this.name === 'patches') return super.each(fcn)
    //     if (this.isBaseSet()) return this.baseSetAsk(fcn)
    //     if (this.isBreedSet()) return this.cloneAsk(fcn)
    // }

    // An ask function for mutable baseSets.
    // BaseSets can only add past the end of the array.
    // This allows us to manage mutations by allowing length change,
    // and managing deletions only within the original length.
    baseSetAsk(fcn) {
        if (this.length === 0) return
        const lastID = this.last().id

        // Added obj's have id > lastID. Just check for deletions.
        // There Be Dragons:
        // - AgentSet can become length 0 if all deleted
        // - For loop tricky:
        //   - i can become negative w/in loop:
        //   - i can become bigger than current AgentSet
        //   - Guard w/ i<len & i>=0
        for (let i = 0; i < this.length; i++) {
            const obj = this[i]
            const id = obj.id
            if (id > lastID) break
            fcn(obj, i, this)
            if (i >= this.length) break
            if (this[i].id > id) {
                while (i >= 0 && this[i].id > id) i-- // ok if -1
            }
        }
    }
    // baseSetAsk(fcn) {
    //     if (this.length === 0) return
    //     // const length = this.length
    //     const lastID = this.last().id

    //     // Added obj's have id > lastID. Just check for deletions.
    //     // There Be Dragons:
    //     // - AgentSet can become length 0 if all deleted
    //     // - While loop tricky:
    //     //   - i can beocme negative w/in while loop:
    //     //   - i can beocme bigger than current AgentSet:
    //     //   - Guard w/ i<len & i>=0
    //     for (let i = 0; i < this.length && this[i].id <= lastID; i++) {
    //         const id = this[i].id
    //         fcn(this[i], i, this)
    //         while (i < this.length && i >= 0 && this[i].id > id) {
    //             i--
    //         }
    //     }
    // }

    // For breeds, mutations can occur in many ways.
    // This solves this by cloning the initial array and
    // managing agents that have died or changed breed.
    // In other words, we can be concerned only with mutations
    // of the agents themselves.
    cloneAsk(fcn) {
        const clone = this.clone()
        for (let i = 0; i < clone.length; i++) {
            const obj = clone[i]
            // obj.id > 0: obj.die() sets id to -1
            if (obj.breed == this && obj.id > 0) {
                fcn(obj, i, clone)
            }
        }
        // return this
    }

    // // Temp: data transfer. May not use if AgentArray.typedSample
    // // (OofA) is sufficient.
    // propsArrays(keys, indexed = true) {
    //     const result = indexed ? {} : new AgentArray(this.length)
    //     if (util.isString(keys)) keys = keys.split(' ')
    //     for (let i = 0; i < this.length; i++) {
    //         const vals = []
    //         const agent = this[i]
    //         for (let j = 0; j < keys.length; j++) {
    //             vals.push(agent[keys[j]])
    //         }
    //         result[indexed ? agent.id : i] = vals
    //     }
    //     return result
    // }
    // propsObjects(keys, indexed = true) {
    //     const result = indexed ? {} : new AgentArray(this.length)
    //     // if (util.isString(keys)) keys = keys.split(' ')
    //     if (util.isString(keys)) keys = keys.split(/,*  */)
    //     for (let i = 0; i < this.length; i++) {
    //         const vals = {}
    //         const agent = this[i]
    //         for (let j = 0; j < keys.length; j++) {
    //             // Parse key/val pair for nested objects
    //             let key = keys[j],
    //                 val
    //             if (key.includes(':')) {
    //                 [key, val] = key.split(':')
    //                 val = util.getNestedObject(agent, val)
    //             } else {
    //                 if (key.includes('.')) {
    //                     throw Error(
    //                         'propsObjects: dot notation requires name:val: ' +
    //                             key
    //                     )
    //                 }
    //                 val = agent[key]
    //             }

    //             // If function, val is result of calling it w/ no args
    //             if (util.typeOf(val) === 'function') val = agent[val.name]()

    //             // Do id substitution for arrays & objects
    //             if (util.isArray(val)) {
    //                 if (util.isInteger(val[0].id)) {
    //                     if (val.ID) {
    //                         throw Error(
    //                             'propsObjects: value cannot be an AgentSet: ' +
    //                                 key
    //                         )
    //                     }
    //                     // assume all are agents, replace w/ id
    //                     val = val.map(v => v.id)
    //                 } else {
    //                     // Should check that all values are primitives
    //                     val = util.clone(val)
    //                 }
    //             } else if (util.isObject(val)) {
    //                 if (util.isInteger(val.id)) {
    //                     val = val.id
    //                 } else {
    //                     val = Object.assign({}, obj)
    //                     util.forLoop(val, (v, key) => {
    //                         // Should check that all values are primitives
    //                         if (util.isInteger(v.id)) {
    //                             v[key] = v.id
    //                         }
    //                     })
    //                 }
    //             }

    //             vals[key] = val
    //         }
    //         result[indexed ? agent.id : i] = vals
    //     }
    //     return result
    // }
}

export default AgentSet
