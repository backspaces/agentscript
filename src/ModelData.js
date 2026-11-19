// Save a whole model as plain data, and make a working model from that
// data again:
//
//   import { toData, fromData, restore } from './ModelData.js'
//
//   const data = toData(model)                // plain objects: JSON-ready
//   const model2 = await fromData(Model, data) // a working model again
//   restore(model3, data) // or put the data into a model that exists
//
// restore() is for when other things hold the model, like a view: they
// keep working, and see the restored agents.
//
// The data has every turtle, patch and link, with their ids, breeds and
// variables, the links' two ends, and the model's own variables, ticks and
// done. The restored model carries on exactly as the saved one would have:
// test/denoModelData.js checks this for every model in models/.
//
// Uses: keeping a model in a server's storage between requests (a
// Cloudflare Durable Object, say), saving one to a file, or sending one
// from a server to a page that draws it.
//
// What's saved, for the model and each agent: its own variables that hold
// numbers, text, true/false or null; agents (saved as a reference to
// their id); and lists of those. Anything else, like a function, a
// DataSet or an AgentSet such as model.turtles, isn't saved. AgentScript's
// own wiring, like a turtle's links or a patch's neighbors, is read-only,
// and isn't saved either: AgentScript rebuilds it.

import AgentArray from './AgentArray.js'

// ---- Saving -----------------------------------------------------------

/**
 * The whole model, as plain data.
 * @param {Model} model
 * @returns {Object} { variables, ticks, done, nextIds, patches, turtles, links }
 */
export function toData(model) {
    return {
        variables: values(model, ['ticks', 'done']),
        ticks: model.ticks,
        done: model.done ?? false,
        // The ids the next new turtle and link will get
        nextIds: { turtles: model.turtles.ID, links: model.links.ID },
        patches: model.patches.map(p => ({
            breed: breedName(p),
            ...values(p, ['turtles']),
        })),
        turtles: model.turtles.map(t => ({ breed: breedName(t), ...values(t) })),
        links: model.links.map(l => ({
            breed: breedName(l),
            ...values(l, ['end0', 'end1']),
            end0: l.end0.id,
            end1: l.end1.id,
        })),
    }
}

const breedName = agent => agent.agentSet.name

// An object's own variables that are data. AgentScript keeps its wiring (a
// turtle's links, a patch's neighbors) in read-only properties, so only
// what a model can write is saved.
function values(object, skip = []) {
    const out = {}
    for (const [key, value] of Object.entries(object)) {
        if (skip.includes(key) || !writable(object, key)) continue
        const saved = encode(value)
        if (saved !== undefined) out[key] = saved
    }
    return out
}
const writable = (object, key) =>
    Object.getOwnPropertyDescriptor(object, key).writable

// A value as data:
// - a number, text, true/false or null: as it is
// - an agent: a reference to it, like { agent: 'turtles', id: 3 }
// - a list of those (a turtle's path, say): { list: [...] }
// Anything else answers undefined, and isn't saved.
function encode(value) {
    if (isPlain(value)) return value
    if (isAgent(value)) {
        return { agent: value.agentSet.baseSet.name, id: value.id }
    }
    if (Array.isArray(value) && !value.baseSet) {
        const items = value.map(encode)
        if (!items.includes(undefined)) {
            return { list: items, agentArray: value.constructor.name !== 'Array' }
        }
    }
    return undefined
}
const isPlain = v =>
    ['number', 'string', 'boolean'].includes(typeof v) || v === null
const isAgent = v =>
    v && typeof v === 'object' && v.agentSet && typeof v.id === 'number'

// ---- Restoring --------------------------------------------------------

/**
 * A working model, made from toData()'s data.
 * @param {Class} Model The model's class, like SchellingModel
 * @param {Object} data What toData() returned, or a JSON copy of it
 * @returns {Promise<Model>}
 */
export async function fromData(Model, data) {
    // Start the way any model starts. setup() makes the model's breeds and
    // defaults; then restore() replaces its agents with the saved ones.
    const model = new Model()
    await model.startup() // loads any data the model needs
    model.setup()
    restore(model, data)
    return model
}

/**
 * Put toData()'s data into a model that already exists, replacing its
 * turtles, links, patch variables and model variables. The model keeps its
 * own turtles, patches and links AgentSets, so anything holding them, like
 * a view, still works: it just sees the restored agents.
 *
 * The model must be of the same class as the saved one, and have run
 * setup() at least once, so its breeds exist.
 * @param {Model} model
 * @param {Object} data What toData() returned, or a JSON copy of it
 * @returns {Model} the same model
 */
export function restore(model, data) {
    model.links.clear()
    model.turtles.clear()
    const breed = (base, name) => model[name] ?? model[base]

    // The turtles and links again, with their saved ids, in id order.
    const turtleById = new Map()
    for (const t of data.turtles) {
        model.turtles.ID = t.id
        turtleById.set(t.id, breed('turtles', t.breed).createOne())
    }
    const linkById = new Map()
    for (const l of data.links) {
        model.links.ID = l.id
        const [end0, end1] = [turtleById.get(l.end0), turtleById.get(l.end1)]
        linkById.set(l.id, breed('links', l.breed).createOne(end0, end1))
    }
    model.turtles.ID = data.nextIds.turtles
    model.links.ID = data.nextIds.links

    // Then everyone's variables. They come after making all the agents, so
    // a reference to any agent can be found.
    const find = {
        turtles: id => turtleById.get(id),
        links: id => linkById.get(id),
        patches: id => model.patches[id],
    }
    const decode = value => {
        if (value?.agent) return find[value.agent](value.id)
        if (value?.list) {
            const items = value.list.map(decode)
            return value.agentArray ? AgentArray.from(items) : items
        }
        return value
    }
    const fill = (object, saved, skip) => {
        for (const [key, value] of Object.entries(saved)) {
            if (!skip.includes(key)) object[key] = decode(value)
        }
    }

    data.patches.forEach((saved, i) => {
        const patch = model.patches[i]
        // setup() may have given this patch variables the saved one didn't
        // have: remove them.
        for (const [key, value] of Object.entries(patch)) {
            if (key === 'id' || key === 'turtles' || !writable(patch, key))
                continue
            if (encode(value) !== undefined) delete patch[key]
        }
        breed('patches', saved.breed).setBreed(patch)
        fill(patch, saved, ['breed', 'id'])
    })
    for (const t of data.turtles) fill(turtleById.get(t.id), t, ['breed', 'id'])
    for (const l of data.links) {
        fill(linkById.get(l.id), l, ['breed', 'id', 'end0', 'end1'])
    }
    fill(model, data.variables, [])
    model.ticks = data.ticks
    model.done = data.done

    // Each patch remembers which turtles are on it; make them work it out
    // afresh, from where the turtles are now.
    model.patches.ask(p => (p.turtles = null))
    return model
}
