import util from './util.js'

// class World defines the coordinate system for the model.
// It will be upgraded with methods converting from other
// transforms like GIS and DataSets.

const defaultZ = (maxX, maxY) => Math.max(maxX, maxY)

export default class World {
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
    // static defaultWorld(maxX = 16, maxY = maxX, maxZ = defaultZ(maxX, maxY)) {
    static defaultWorld(maxX = 16, maxY = maxX, maxZ = maxX) {
        return new World(World.defaultOptions(maxX, maxY, maxZ))
    }

    // ======================

    // Initialize the world w/ defaults overridden w/ options.
    constructor(options = World.defaultOptions()) {
        // Object.assign(this, World.defaultOptions()) // initial this w/ defaults
        // Object.assign(this, options) // override defaults with options

        // override defaults with the given options
        options = Object.assign(World.defaultOptions(), options)
        Object.assign(this, options) // set the option values
        this.setWorld() // convert these to rest of world parameters
    }
    // Complete properties derived from minX/Y, maxX/Y (patchSize === 1)
    setWorld() {
        let { minX, maxX, minY, maxY, minZ, maxZ } = this
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

        this.numPatches = this.width * this.height
    }
    randomPoint() {
        return [
            util.randomFloat2(this.minXcor, this.maxXcor),
            util.randomFloat2(this.minYcor, this.maxYcor),
        ]
    }
    random3DPoint() {
        // const pt = this.randomPoint()
        // pt.push(util.randomFloat2(this.minZcor, this.maxZcor))
        // return pt
        return [
            util.randomFloat2(this.minXcor, this.maxXcor),
            util.randomFloat2(this.minYcor, this.maxYcor),
            util.randomFloat2(this.minZcor, this.maxZcor),
        ]
    }
    randomPatchPoint() {
        return [
            // REMIND: can maxX/Y be in the result?
            util.randomInt2(this.minX, this.maxX),
            util.randomInt2(this.minY, this.maxY),
        ]
    }
    // Test x,y for being on-world.
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
        const { minX, maxY, numX, maxXcor, maxYcor } = this
        x = x === maxXcor ? maxX : Math.round(x)
        y = y === maxYcor ? maxY : Math.round(y)
        return x - minX + numX * (maxY - y)
    }
    // patchIndexToXY(index) {}
}

class BBoxTransform {
    // geo bbox definition:
    //    https://tools.ietf.org/html/rfc7946#section-5
    //    [west, south, east, north]
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

        Object.assign(this, { mx, my, bx, by })
    }
    toWorld(bboxPoint) {
        const { mx, my, bx, by } = this
        const [bboxX, bboxY] = bboxPoint
        const x = (bboxX - bx) / mx
        const y = (bboxY - by) / my
        return [x, y]
    }
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
