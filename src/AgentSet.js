// import * as util from './utils.js' // just for debugging
import AgentArray from './AgentArray.js'

/**
 * A model's {@link Patches}, {@link Turtles}, {@link Links},
 * are all subclasses of AgentSet.
 *
 * AgentSets are {@link AgentArray}s that are factories for their own Agents.
 * That means you do *not* call `new Turtle()`, rather Turtles
 * will create the Turtle instances, adding them to itself.
 *
 * Finally, a Breed is simply a subarray of Patches, Turtles, Links.
 * Patches could have a Streets breed, Turtles could have Cops and Robbers
 * breeds, and Links Spokes and Rim breeds
 *
 * AgentSets are not created directly by modelers.
 * Instead, class {@link Model} creates them along with their Breeds.
 * You can easily skip this initially, instead simply understand AgentSets
 * are the basis for Patches, Turtles, Links & Breeds
 *
 * @param {Model} model Instance of Class Model to which I belong
 * @param {Patch|Turtle|Link} AgentClass Class of items stored in this AgentSet
 * @param {String} name Name of this AgentSet. Ex: Patches
 * @param {Patches|Turtles|Links} [baseSet=null] If a Breed, it's parent AgentSet
 */

class AgentSet extends AgentArray {
    // Inherited by Patches, Turtles, Links
    model
    name
    baseSet
    AgentClass

    /**
     * Magic to return AgentArrays rather than AgentSets
     * [Symbol.species](https://goo.gl/Zsxwxd)
     *
     * @readonly
     */
    static get [Symbol.species]() {
        return AgentArray
    }

    constructor(model, AgentClass, name, baseSet = null) {
        if (name.length === 0) debugger
        super() // create empty AgentArray

        baseSet = baseSet || this // if not a breed, set baseSet to this
        Object.assign(this, { model, name, baseSet, AgentClass })

        if (this.isBaseSet()) {
            // BaseSets know their breeds and keep the ID global
            this.breeds = {} // will contain breedname: breed entries
            this.ID = 0
        } else {
            // Breeds inherit from their baseSet and add themselves to baseSet
            Object.setPrototypeOf(this, Object.getPrototypeOf(baseSet))
            this.baseSet.breeds[name] = this
        }

        // console.log('AgentSet:', this)

        this.protoMixin(AgentClass)
    }
    /**
     * Add common variables to an Agent being added to this AgentSet.
     *
     * Each Agent has it's AgentSet and the Model instance.
     * It also has an id, set by the AgentSet's global ID.
     *
     * The Agent also has three methods added: setBreed, getBreed, isBreed.
     *
     * @param {Object} agentProto A new instance of the Agent being added
     * @param {Patch|Turtle|Link} AgentClass It's Class
     */
    protoMixin(AgentClass) {
        this.agentProto = new AgentClass()
        const agentProto = this.agentProto

        // if (agentProto.setBreed) {
        //     console.log('agentProto.setBreed already set', this, agentProto)
        //     // return
        // }

        // if (agentProto[this.baseSet.name]) {
        //     console.log('Duplicate agentProto name', this.baseSet.name)
        //     // return
        // }

        Object.assign(agentProto, {
            agentSet: this,
            model: this.model,
        })
        agentProto[this.baseSet.name] = this.baseSet

        if (!agentProto.setBreed) {
            Object.assign(agentProto, {
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
            Object.defineProperty(agentProto, 'breed', {
                get: function () {
                    return this.agentSet
                },
            })
        } else {
            console.log('protoMixin: agentClass.proto already set', AgentClass)
        }
    }

    /**
     * @param {Object} o An Agent to be added to this AgentSet
     * @returns {Object} The input Agent, bound to this AgentSet.
     * @description
     * Add an Agent to this AgentSet.  Only used by factory methods.
     * Adds the `id` property to Agent. Increment AgentSet `ID`.
     */
    addAgent(o = undefined) {
        o = o || this.agentProto.newInstance(this.agentProto) // REMIND: Simplify! Too slick.
        if (this.isBreedSet()) {
            this.baseSet.addAgent(o)
        } else {
            o.id = this.ID++
        }
        this.push(o)
        return o
    }
    /**
     * Remove an Agent from this AgentSet
     *
     * @param {Object} o The Agent to be removed
     * @returns {AgentSet} This AgentSet with the Agent removed
     */
    removeAgent(o) {
        // Note removeAgent(agent) different than remove(agent) which
        // simply removes the agent from it's array

        if (o.id != -1) {
            // Remove me from my baseSet
            if (this.isBreedSet()) this.baseSet.remove(o, 'id')
            // Remove me from my set.
            this.remove(o, 'id')
        }

        return this
    }

    /**
     * Move an agent from its AgentSet/breed to be in this AgentSet/breed
     *
     * @param {Agent} a An agent, a member of another AgentSet
     * @returns {Agent} The updated agent
     */
    setBreed(a) {
        // change agent a to be in this breed
        // Return if `a` is already of my breed
        // if (a.agentSet === this) return
        if (a.breed.name === this.name) {
            // console.log('setBreed already has', this.name)
            return
        }
        // Remove/insert breeds (not baseSets) from their agentsets
        if (a.agentSet.isBreedSet()) {
            a.agentSet.remove(a, 'id')
            // console.log('removing breed:', a)
        }
        if (this.isBreedSet()) {
            this.insert(a, 'id')
            // console.log('inserting breed:', a)
        }

        // Give `a` my defaults/statics
        return Object.setPrototypeOf(a, this.agentProto)
    }
    /**
     * Set a default value shared by all Agents in this AgentSet
     *
     * @param {String} name The name of the shared value
     * @param {any} value
     * @returns {AgentSet} This AgentSet
     */
    setDefault(name, value) {
        this.agentProto[name] = value
        return this
    }

    /**
     * Return a default, shared value
     *
     * @param {String} name The name of the default
     * @returns {any} The default value
     */
    getDefault(name) {
        return this.agentProto[name]
        // return this.defaults[name]
    }

    /**
     * Create a subarray of this AgentSet.
     * Example: create a people breed of Turtles:
     *
     * `people = turtles.newBreed('people')`
     *
     * @param {String} name The name of the new breed AgentSet
     * @returns {AgentSet} A subarray of me
     */
    newBreed(name) {
        return new AgentSet(this.model, this.AgentClass, name, this)
    }

    /**
     * @returns {boolean} true if I am a baseSet subarray
     */
    isBreedSet() {
        return this.baseSet !== this
    }
    /**
     * @returns {boolean} true if I am a Patches, Turtles or Links AgentSet
     */
    isBaseSet() {
        return this.baseSet === this
    }

    /**
     * Return breeds in a subset of an AgentSet
     *
     * Ex: patches.inRect(5).withBreed(houses)
     *
     * @param {AgentSet} breed A breed AgentSet
     * @returns {AgentArray}
     */
    withBreed(breed) {
        return this.filter(a => a.agentSet === breed)
    }

    // Abstract method used by subclasses to create and add their instances.
    create() {
        console.log(`AgentSet: Abstract method called: ${this}`)
    }

    /**
     * Remove all Agents from this AgentSet using agent.die() for each agent.
     *
     */
    clear() {
        // die() is an agent method. sets it's id to -1
        while (!this.isEmpty()) this.last().die()
    }

    /**
     * Call fcn(agent, index, array) for each item in AgentArray.
     * Index & array optional. Overrides AgentArray's ask with
     * additional guards for modifications in AgentSet's array.
     *
     * @param {Function} fcn fcn(agent, index?, array?)
     */
    ask(fcn) {
        if (this.length === 0) return
        const lastID = this.last().id // would fail w/o 0 check above
        for (let i = 0; i < this.length && this[i].id <= lastID; i++) {
            fcn(this[i], i, this)
        }
    }
}

export default AgentSet
