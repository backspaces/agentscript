import * as util from './utils.js'
// import AgentArray from './AgentArray.js'
import AgentList from './AgentList.js'
import AgentSet from './AgentSet.js'
import DataSet from './DataSet.js'

/**
 * Patches are the world other AgentSets live on.
 * They define a coord system from the Model's World values:
 * minX, maxX, minY, maxY, (minZ, maxZ) (z optional)
 *
 * Patches form a grid of Patch objects which can store world data
 * (elevation, fires, ant pheromones, buildings, roads, gis spatial data, water and so on)
 *
 * Created by class Model. Used by modeler in their Model subclass
 */
class Patches extends AgentSet {
    /**
     * Creates an instance of Patches.
     * @param {Model} model An instance of class Model
     * @param {Patch} AgentClass The Patch class managed by Patches
     * @param {string} name Name of the AgentSet
     */
    constructor(model, AgentClass, name) {
        // AgentSet sets these variables:
        // model, name, baseSet, world: model.world, agentProto: new AgentClass
        // REMIND: agentProto: defaults, agentSet, world, [name]=agentSet.baseSet
        super(model, AgentClass, name)

        // Skip if a breedSet (don't rebuild patches!).
        if (this.isBreedSet()) return

        this.populate()
        // this.setPixels()
        this.labels = [] // sparse array for labels
    }
    // Set up all the patches.
    populate() {
        util.repeat(this.model.world.numX * this.model.world.numY, i => {
            this.addAgent() // Object.create(this.agentProto))
        })
    }

    // Return the offsets from a patch for its 8 element neighbors.
    // Specialized to be faster than inRect below.
    neighborsOffsets(x, y) {
        const { minX, maxX, minY, maxY, numX } = this.model.world
        if (x === minX) {
            if (y === minY) return [-numX, -numX + 1, 1]
            if (y === maxY) return [1, numX + 1, numX]
            return [-numX, -numX + 1, 1, numX + 1, numX]
        }
        if (x === maxX) {
            if (y === minY) return [-numX - 1, -numX, -1]
            if (y === maxY) return [numX, numX - 1, -1]
            return [-numX - 1, -numX, numX, numX - 1, -1]
        }
        if (y === minY) return [-numX - 1, -numX, -numX + 1, 1, -1]
        if (y === maxY) return [1, numX + 1, numX, numX - 1, -1]
        return [-numX - 1, -numX, -numX + 1, 1, numX + 1, numX, numX - 1, -1]
    }
    // Return the offsets from a patch for its 4 element neighbors (N,S,E,W)
    neighbors4Offsets(x, y) {
        const numX = this.model.world.numX
        return this.neighborsOffsets(x, y).filter(
            n => Math.abs(n) === 1 || Math.abs(n) === numX
        ) // slightly faster
        // .filter((n) => [1, -1, numX, -numX].indexOf(n) >= 0)
        // .filter((n) => [1, -1, numX, -numX].includes(n)) // slower than indexOf
    }

    /**
     * Return the 8 patch
     * ["Moore" neighbors](https://en.wikipedia.org/wiki/Moore_neighborhood)
     * of the given patch.
     * Will be less than 8 on the edge of the patches
     *
     * @param {Patch} patch a Patch instance
     * @returns {AgentList} An array of the neighboring patches
     */
    neighbors(patch) {
        const { id, x, y } = patch
        const offsets = this.neighborsOffsets(x, y)
        // const as = new AgentArray(offsets.length)
        const as = new AgentList(this.model, offsets.length)
        offsets.forEach((o, i) => {
            as[i] = this[o + id]
        })
        return as
    }

    /**
     * Return the 4 patch
     * ["Van Neumann" neighbors](https://en.wikipedia.org/wiki/Von_Neumann_neighborhood)
     * of the given patch.
     * Will be less than 4 on the edge of the patches
     *
     * @param {Patch} patch a Patch instance
     * @returns {AgentList} An array of the neighboring patches
     */
    neighbors4(patch) {
        const { id, x, y } = patch
        const offsets = this.neighbors4Offsets(x, y)
        // const as = new AgentArray(offsets.length)
        const as = new AgentList(this.model, offsets.length)
        offsets.forEach((o, i) => {
            as[i] = this[o + id]
        })
        return as
    }

    /**
     * Assign a DataSet's values into the patches as the given property name
     *
     * @param {DataSet} dataSet An instance of [DataSet](./DataSet.html)
     * @param {string} property A Patch property name
     * @param {boolean} [useNearest=false] Resample to nearest dataset value?
     */
    importDataSet(dataSet, property, useNearest = false) {
        if (this.isBreedSet()) {
            // REMIND: error
            util.warn('Patches: exportDataSet called with breed, using patches')
            this.baseSet.importDataSet(dataSet, property, useNearest)
            return
        }
        const { numX, numY } = this.model.world
        const dataset = dataSet.resample(numX, numY, useNearest)
        this.ask(p => {
            p[property] = dataset.data[p.id]
        })
    }
    /**
     * Extract a property from each Patch as a DataSet
     *
     * @param {string} property The patch numeric property to extract
     * @param {Type} [Type=Array] The DataSet array's type
     * @returns {DataSet} A DataSet of the patche's values
     */
    exportDataSet(property, Type = Array) {
        if (this.isBreedSet()) {
            util.warn('Patches: exportDataSet called with breed, using patches')
            return this.baseSet.exportDataSet(property, Type)
        }
        const { numX, numY } = this.model.world
        // let data = util.arrayProps(this, property)
        let data = this.props(property)
        data = util.convertArrayType(data, Type)
        return new DataSet(numX, numY, data)
    }

    // Return id/index given valid x,y integers
    /**
     * Return index into Patches given valid x,y integers
     *
     * @param {number} x Integer X value
     * @param {number} y Integer Y value
     * @returns {number} Integer index into Patches array
     */
    patchIndex(x, y) {
        const { minX, maxY, numX } = this.model.world
        return x - minX + numX * (maxY - y)
    }

    // Return patch at x,y float values
    // Return undefined if off-world
    patch(x, y) {
        // Benny suggests: (in PR wrap x and y in patches.patch(x, y))
        // const intX = Math.round(util.wrap(x, this.model.world.minXcor, this.model.world.maxXcor))
        // const intY = Math.round(util.wrap(y, this.model.world.minYcor, this.model.world.maxYcor))

        if (!this.model.world.isOnWorld(x, y)) return undefined
        const intX =
            x === this.model.world.maxXcor
                ? this.model.world.maxX
                : Math.round(x) // handle n.5 round up to n + 1
        const intY =
            y === this.model.world.maxYcor
                ? this.model.world.maxY
                : Math.round(y)
        return this.patchXY(intX, intY)
    }
    // Return the patch at x,y where both are valid integer patch coordinates.
    patchXY(x, y) {
        return this[this.patchIndex(x, y)]
    }

    // Patches in rectangle dx, dy from p, dx, dy integers.
    // Both dx & dy are half width/height of rect
    patchRect(p, dx, dy = dx, meToo = true) {
        // Return cached rect if one exists.
        if (p.rectCache) {
            const index = this.cacheIndex(dx, dy, meToo)
            const rect = p.rectCache[index]
            if (rect) return rect
        }
        // const rect = new AgentArray()
        const rect = new AgentList(this.model)
        let { minX, maxX, minY, maxY } = this.model.world
        minX = Math.max(minX, p.x - dx)
        maxX = Math.min(maxX, p.x + dx)
        minY = Math.max(minY, p.y - dy)
        maxY = Math.min(maxY, p.y + dy)
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pnext = this.patchXY(x, y)
                if (p !== pnext || meToo) rect.push(pnext)
            }
        }
        return rect
    }
    // Return patchRect given legal x, y values
    patchRectXY(x, y, dx, dy = dx, meToo = true) {
        return this.patchRect(this.patch(x, y), dx, dy, meToo)
    }

    // Performance: create a cached rect of this size in sparse array.
    // Index of cached rect is dx * dy + meToo ? 0 : -1.
    // This works for edge rects that are not that full size.
    // patchRect will use this if matches dx, dy, meToo.
    cacheIndex(dx, dy = dx, meToo = true) {
        return (2 * dx + 1) * (2 * dy + 1) + (meToo ? 0 : -1)
    }
    cacheRect(dx, dy = dx, meToo = true, clear = true) {
        const index = this.cacheIndex(dx, dy, meToo)
        this.ask(p => {
            if (!p.rectCache || clear) p.rectCache = []
            const rect = this.inRect(p, dx, dy, meToo)
            p.rectCache[index] = rect
        })
    }

    // Return patches within the patch rect, dx, dy integers
    // default is square & meToo
    inRect(patch, dx, dy = dx, meToo = true) {
        const pRect = this.patchRect(patch, dx, dy, meToo)
        if (this.isBaseSet()) return pRect
        return pRect.withBreed(this)
    }
    // Return patches within float radius distance of patch
    inRadius(patch, radius, meToo = true) {
        const dxy = Math.ceil(radius)
        const pRect = this.inRect(patch, dxy, dxy, meToo)
        return pRect.inRadius(patch, radius, meToo)
    }
    // Patches in cone from patch in direction `heading`,
    // with `coneAngle` width and within float `radius`
    inCone(patch, radius, coneAngle, heading, meToo = true) {
        const dxy = Math.ceil(radius)
        const pRect = this.inRect(patch, dxy, dxy, meToo)
        // // Using AgentArray's inCone, using radians
        // heading = this.model.toRads(heading)
        // coneAngle = this.model.toAngleRads(coneAngle)
        // return pRect.inCone(patch, radius, coneAngle, heading, meToo)
        return pRect.inCone(patch, radius, coneAngle, heading, meToo)
    }

    // Return patch at distance and angle from obj's (patch or turtle)
    // x, y (floats). If off world, return undefined.
    // Does not take into account the angle of the agent.
    patchAtHeadingAndDistance(agent, heading, distance) {
        heading = this.model.toRads(heading)
        let { x, y } = agent
        x = x + distance * Math.cos(heading)
        y = y + distance * Math.sin(heading)
        return this.patch(x, y)
    }

    // Return true if patch on edge of world
    isOnEdge(patch) {
        const { x, y } = patch
        const { minX, maxX, minY, maxY } = this.model.world
        return x === minX || x === maxX || y === minY || y === maxY
    }
    // returns the edge patches for this breed.
    // generally called with patches.baseSet/model.patches.
    edgePatches() {
        return this.filter(p => this.isOnEdge(p))
    }

    // Diffuse the value of patch variable `p.v` by distributing `rate` percent
    // of each patch's value of `v` to its neighbors.
    // If the patch has less than 4/8 neighbors, return the extra to the patch.
    diffuse(v, rate) {
        this.diffuseN(8, v, rate)
    }
    diffuse4(v, rate) {
        this.diffuseN(4, v, rate)
    }
    diffuseN(n, v, rate) {
        // Note: for-of loops removed: chrome can't optimize them
        // test/apps/patches.js 22fps -> 60fps
        // zero temp variable if not yet set
        if (this[0]._diffuseNext === undefined) {
            // for (const p of this) p._diffuseNext = 0
            for (let i = 0; i < this.length; i++) this[i]._diffuseNext = 0
        }

        // pass 1: calculate contribution of all patches to themselves and neighbors
        // for (const p of this) {
        for (let i = 0; i < this.length; i++) {
            const p = this[i]
            const dv = p[v] * rate
            const dvn = dv / n
            const neighbors = n === 8 ? p.neighbors : p.neighbors4
            const nn = neighbors.length
            p._diffuseNext += p[v] - dv + (n - nn) * dvn
            // for (const n of neighbors) n._diffuseNext += dvn
            for (let i = 0; i < neighbors.length; i++) {
                neighbors[i]._diffuseNext += dvn
            }
        }
        // pass 2: set new value for all patches, zero temp,
        // for (const p of this) {
        for (let i = 0; i < this.length; i++) {
            const p = this[i]
            p[v] = p._diffuseNext
            p._diffuseNext = 0
        }
    }
}

export default Patches
