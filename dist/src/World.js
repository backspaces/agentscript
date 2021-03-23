import * as util from './utils.js'

// class World defines the coordinate system for the model.
// It will be  upgraded with methods converting from other
// transforms like  GIS and DataSets.

// const defaultZ = (maxX, maxY) => Math.max(maxX, maxY)

/**
 * @private
 * @typedef {Object} WorldOptions
 * @property {number} minX Max world patch x integer value
 * @property {number} minY Max world patch y integer value
 * @property {number} minZ Max world patch z integer value
 * @property {number} maxX Min world patch x integer value
 * @property {number} maxY Min world patch y integer value
 * @property {number} maxZ Min world patch z integer value
 */

/**
 * @description
 * Class World defines the coordinate system for the model.
 * It has transforms for multiple coordinate systems.
 *
 * The world is defined by an object with 6 properties:
 *
 *          WorldOptions = {
 *              minX: integer,
 *              maxX: integer,
 *              minY: integer,
 *              maxY: integer,
 *              minZ: integer,
 *              maxZ: integer,
 *          }
 */
export default class World {
    maxX = 16
    maxY = 16
    maxZ = 16
    minX = -16
    minY = -16
    minZ = -16

    /**
     * Create a new World object given an Object with optional
     * minX, maxX, minY, maxY, minZ, maxZ overriding class properties.
     * @param {World|WorldOptions|Object} options Object with overrides for class properties
     */
    constructor(options = {}) {
        Object.assign(this, options) // set the option override values
        this.setWorld() // convert these to rest of world parameters
    }

    // Until class properties universally, this approach is used:
    // setClassProperties() {
    //     this.maxX = 16
    //     this.maxY = 16
    //     this.maxZ = 16
    //     this.minX = -this.maxX
    //     this.minY = -this.maxY
    //     this.minZ = -this.maxZ
    // }

    /**
     * Return a default options object, origin at center.
     *
     * @param {number} [maxX=16] Integer max X value
     * @param {number} [maxY=maxX] Integer max Y value
     * @param {number} [maxZ=Math.max(maxX, maxY)] Integer max Z value
     * @return {WorldOptions}
     */
    static defaultOptions(maxX = 16, maxY = maxX, maxZ = Math.max(maxX, maxY)) {
        return {
            minX: -maxX,
            maxX: maxX,
            minY: -maxY,
            maxY: maxY,
            minZ: -maxZ,
            maxZ: maxZ,
        }
    }
    /**
     * Factory to create a default World instance.
     *
     * @param {number} [maxX=16] Integer max X value
     * @param {number} [maxY=maxX] Integer max Y value
     * @param {number} [maxZ=Math.max(maxX, maxY)] Integer max Z value
     * @return {World}
     */
    static defaultWorld(maxX = 16, maxY = maxX, maxZ = maxX) {
        return new World(World.defaultOptions(maxX, maxY, maxZ))
    }

    // ======================

    setWorld() {
        // Complete properties derived from minX/Y, maxX/Y (patchSize === 1)

        let { minX, maxX, minY, maxY, minZ, maxZ } = this

        util.forLoop({ minX, maxX, minY, maxY, minZ, maxZ }, (val, key) => {
            if (!Number.isInteger(val))
                throw Error(`${key}:${val} must be an integer`)
        })

        this.numX = this.width = maxX - minX + 1
        this.numY = this.height = maxY - minY + 1
        // if (maxZ == null) maxZ = this.maxZ = Math.max(this.width, this.height)
        this.numZ = this.depth = maxZ - minZ + 1

        this.minXcor = minX - 0.5
        this.maxXcor = maxX + 0.5
        this.minYcor = minY - 0.5
        this.maxYcor = maxY + 0.5
        this.minZcor = minZ - 0.5
        this.maxZcor = maxZ + 0.5

        // The midpoints of the world, in world coords.
        this.centerX = (minX + maxX) / 2
        this.centerY = (minY + maxY) / 2
        this.centerZ = (minZ + maxZ) / 2

        this.numPatches = this.numX * this.numY
    }

    /**
     * Return a random 2D point within the World
     *
     * @return {Array} A random x,y float array
     */
    randomPoint() {
        return [
            util.randomFloat2(this.minXcor, this.maxXcor),
            util.randomFloat2(this.minYcor, this.maxYcor),
        ]
    }

    /**
     * Return a random 3D point within the World
     *
     * @return {Array} A random x,y,z float array
     */
    random3DPoint() {
        return [
            util.randomFloat2(this.minXcor, this.maxXcor),
            util.randomFloat2(this.minYcor, this.maxYcor),
            util.randomFloat2(this.minZcor, this.maxZcor),
        ]
    }

    /**
     * Return a random Patch 2D integer point
     *
     * @return {Array}  A random x,y integer array
     */
    randomPatchPoint() {
        return [
            util.randomInt2(this.minX, this.maxX),
            util.randomInt2(this.minY, this.maxY),
        ]
    }

    /**
     * Given x,y,z values return true if within the world
     *
     * @param {number} x x value
     * @param {number} y y value
     * @param {number} [z=this.centerZ] z value
     * @return {boolean} Whether or not on-world
     */
    isOnWorld(x, y, z = this.centerZ) {
        return (
            this.minXcor <= x &&
            x <= this.maxXcor &&
            //
            this.minYcor <= y &&
            y <= this.maxYcor &&
            //
            this.minZcor <= z &&
            z <= this.maxZcor
        )
    }
    // cropToWorld(x, y) {}

    // Note minX etc NOT the world's but of the coord sys we want to use.
    /**
     * Return an instance of a bounding box 2D transform.
     * It linearly interpolates between the given minX, minY, maxX, maxY,
     * and the world's values of the same properties.
     *
     * The parameters are in the popular geojson order: west, south, east, north
     *
     * Useful for Canvas top-left transforms and geojson transforms.
     *
     * @param {number} minX min bounding box x value
     * @param {number} minY min bounding box y value
     * @param {number} maxX max bounding box x value
     * @param {number} maxY max bounding box y value
     * @return {BBoxTransform} Instance of the BBoxTransform
     */
    bboxTransform(minX, minY, maxX, maxY) {
        return new BBoxTransform(minX, minY, maxX, maxY, this)
    }

    // ### Following use PatchSize

    // Get the world size in pixels. PatchSize is optional, defalting to 1
    getWorldSize(patchSize = 1) {
        return [this.numX * patchSize, this.numY * patchSize]
    }

    // Convert a canvas context to world euclidean coordinates
    // Change the ctx.canvas size, determined by patchSize.
    setEuclideanTransform(ctx, patchSize) {
        // ctx.canvas.width = this.numX * patchSize
        // ctx.canvas.height = this.numY * patchSize
        this.setCanvasSize(ctx.canvas, patchSize)
        ctx.restore() // close earlier save(). OK if no save called yet.
        ctx.save()
        ctx.scale(patchSize, -patchSize)
        ctx.translate(-this.minXcor, -this.maxYcor)
    }
    // Return patch size for given canvas.
    // Error if canvas patch width/height differ.
    patchSize(canvas) {
        const { numX, numY } = this
        const { clientWidth: width, clientHeight: height } = canvas
        const xSize = width / numX
        const ySize = height / numY
        if (xSize !== ySize) {
            throw Error(`World patchSize: x/y sizes differ ${xSize}, ${ySize}`)
        }
        return xSize
    }
    // Change canvas size to this world's size.
    // Does not change size if already the same, preserving the ctx content.
    setCanvasSize(canvas, patchSize) {
        const [width, height] = this.getWorldSize(patchSize)
        util.setCanvasSize(canvas, width, height)
    }

    // Convert pixel location (top/left offset i.e. mouse) to patch coords (float)
    pixelXYtoPatchXY(x, y, patchSize) {
        return [this.minXcor + x / patchSize, this.maxYcor - y / patchSize]
    }
    // Convert patch coords (float) to pixel location (top/left offset i.e. mouse)
    patchXYtoPixelXY(x, y, patchSize) {
        return [(x - this.minXcor) * patchSize, (this.maxYcor - y) * patchSize]
    }

    xyToPatchIndex(x, y) {
        if (!this.isOnWorld(x, y)) return undefined
        const { minX, maxX, maxY, numX, maxXcor, maxYcor } = this
        x = x === maxXcor ? maxX : Math.round(x)
        y = y === maxYcor ? maxY : Math.round(y)
        return x - minX + numX * (maxY - y)
    }
    // patchIndexToXY(index) {}
}

/**
 * A linear transformer between world coords and the given bounding box.
 *
 * @class
 * @private
 */
class BBoxTransform {
    // geo bbox definition:
    //    https://tools.ietf.org/html/rfc7946#section-5
    //    [west, south, east, north]
    /**
     * Creates an instance of BBoxTransform.
     * @param {number} minX min bounding box x value
     * @param {number} minY max bounding box x value
     * @param {number} maxX min bounding box y value
     * @param {number} maxY max bounding box y value
     * @param {World} world instance of a World object
     */
    constructor(minX, minY, maxX, maxY, world) {
        if (minX < maxX) console.log('flipX')
        if (maxY < minY) console.log('flipY')

        if (minX < maxX) [minX, maxX] = [maxX, minX]
        if (maxY < minY) [maxY, minY] = [minY, maxY]
        const { maxXcor, maxYcor, minXcor, minYcor } = world

        const mx = (minX - maxX) / (maxXcor - minXcor)
        const my = (maxY - minY) / (maxYcor - minYcor)

        const bx = (minX + maxX - mx * (maxXcor + minXcor)) / 2
        const by = (maxY + minY - my * (maxYcor + minYcor)) / 2

        // Object.assign(this, { mx, my, bx, by })
        this.setClassProperties({ mx, my, bx, by })
    }
    setClassProperties(obj) {
        this.mx = obj.mx
        this.my = obj.my
        this.bx = obj.bx
        this.by = obj.by
    }

    /**
     * Convert from bbox point to world point
     *
     * @param {Array} bboxPoint A point in the bbox coordinates
     * @return {Array} A point in the world coordinates
     */
    toWorld(bboxPoint) {
        const { mx, my, bx, by } = this
        const [bboxX, bboxY] = bboxPoint
        const x = (bboxX - bx) / mx
        const y = (bboxY - by) / my
        return [x, y]
    }

    /**
     * Convert from world point to bbox point
     *
     * @param {Array} worldPoint A point in the world coordinates
     * @return {Array} A point in the bbox coordinates
     */
    toBBox(worldPoint) {
        const { mx, my, bx, by } = this
        const [worldX, worldY] = worldPoint
        const x = mx * worldX + bx
        const y = my * worldY + by
        return [x, y]
    }
}

// export default World

// The midpoints of the world, in world coords.
// (0, 0) for the centered default worlds. REMIND: remove?
// this.centerX = (this.minX + this.maxX) / 2
// this.centerY = (this.minY + this.maxY) / 2

// Calculate patchSize from canvas (any imagable) dimensions
// canvasPatchSize(canvas) {
//     // const [width, height] = canvas
//     return canvas.width / this.numX
// }
// canvasSize(patchSize) {
//     return [this.numX * patchSize, this.numY * patchSize]
// }

// Other ways to specify class properties:
// maxX = 16
// maxY = 16
// maxZ = 16
// minX = -this.maxX
// minY = -this.maxY
// minZ = -this.maxZ

// Note: this is es7 class properties.
// /** @type {number} Max patch x value */ maxX = 16
// /** @type {number} */ maxY = this.maxX
// /** @type {number} */ maxZ = Math.max(this.maxX, this.maxY)
// /** @type {number} */ minX = -this.maxX
// /** @type {number} */ minY = -this.maxY
// /** @type {number} */ minZ = -this.maxZ

//  * @property {number} maxX = 16
//  * @property {number} maxY = this.maxX
//  * @property {number} maxZ = Math.max(this.maxX, this.maxY)
//  * @property {number} minX = -this.maxX
//  * @property {number} minY = -this.maxY
//  * @property {number} minZ = -this.maxZ

// Note: this is es7 class properties.
// /** @type {number} */ mx
// /** @type {number} */ my
// /** @type {number} */ bx
// /** @type {number} */ by
