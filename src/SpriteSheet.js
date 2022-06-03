import * as util from './utils.js'
import Shapes from './Shapes.js'

// Sprites are shapes rendered within a sprite-sheet canvas.
class SpriteSheet {
    // Initialize a one row by cols initial sheet.
    // spriteSize rounded up if a float.
    constructor(spriteSize = 64, cols = 16, usePowerOf2 = false) {
        spriteSize = Math.ceil(spriteSize) // in integer pixels
        Object.assign(this, { spriteSize, cols, usePowerOf2 })
        this.rows = 1
        this.nextCol = 0
        this.nextRow = 0
        this.spritesIndex = {} // index to sprites by name
        this.sprites = []
        this.shapes = new Shapes()
        if (usePowerOf2) this.checkPowerOf2()
        this.ctx = util.createCtx(this.width, this.height) // offscreen
        // THREE texture optional, texture.needsUpdate = true on sheet change
        this.texture = null
    }
    // Get a sprite from cache. Create if not there.
    // Currently an alias for newSprite() but may change.
    getSprite(shapeName, color, strokeColor) {
        return this.newSprite(shapeName, color, strokeColor)
    }
    // Return a random sprite from the cache.
    oneOf() {
        return util.oneOf(this.sprites)
    }

    // Draw the sprite on ctx with given x,y,theta.
    // Uses world/patchSize euclidean coords & angle
    // Does not use transformed ctx, just canvas pixels.
    draw(ctx, sprite, x, y, theta, world, patchSize, noRotate = false) {
        const [x0, y0] = world.patchXYtoPixelXY(x, y, patchSize)
        const theta0 = -theta
        this.drawCanvas(ctx, sprite, x0, y0, theta0, noRotate)
    }
    // Draw the sprite on ctx with given x,y,theta.
    // Uses canvas pixel coords
    drawCanvas(ctx, sprite, x, y, theta = 0, noRotate = false) {
        const { x: x0, y: y0, size } = sprite
        const halfSize = size / 2
        if (noRotate) theta = 0

        if (theta === 0) {
            ctx.drawImage(
                this.ctx.canvas,
                x0,
                y0,
                size,
                size,
                x - halfSize,
                y - halfSize,
                size,
                size
            )
        } else {
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(theta)
            ctx.drawImage(
                this.ctx.canvas,
                x0,
                y0,
                size,
                size,
                -halfSize,
                -halfSize,
                size,
                size
            )
            ctx.restore()
        }
    }

    // A sprite identifies a slot in the sheet.
    // If sprite in cache, return it. Otherwise create and return it.
    newSprite(shapeName, color, strokeColor = null) {
        // Create a normalized name. Use shapes (includes size)
        const name = this.shapes.imageName(
            shapeName,
            this.spriteSize,
            color,
            strokeColor
        )
        // If sprite of ths name already exists, return it.
        if (this.spritesIndex[name]) return this.spritesIndex[name]

        // The sprite image
        const img = this.shapes.shapeToImage(
            shapeName,
            this.spriteSize,
            color,
            strokeColor
        )

        this.checkSheetSize() // Resize ctx if nextRow === rows
        // pixel coords
        const [x, y, size] = [this.nextX, this.nextY, this.spriteSize]
        this.ctx.drawImage(img, x, y, size, size)

        const { nextRow: row, nextCol: col } = this
        const sprite = {
            name,
            id: this.sprites.length,
            x,
            y,
            row,
            col,
            size,
            sheet: this,
        }
        sprite.uvs = this.getUVs(sprite)

        this.incrementRowCol()
        // Add sprite to cache and return it.
        this.spritesIndex[name] = sprite
        this.sprites.push(sprite)
        if (this.texture) this.texture.needsUpdate = true
        return sprite
    }

    // getters for derived values.
    // width & height in pixels
    get width() {
        return this.spriteSize * this.cols
    }
    get height() {
        return this.spriteSize * this.rows
    }
    // next col, row in pixels
    get nextX() {
        return this.spriteSize * this.nextCol
    }
    get nextY() {
        return this.spriteSize * this.nextRow
    }
    checkPowerOf2() {
        const { width, height } = this
        if (!(util.isPowerOf2(width) && util.isPowerOf2(height))) {
            throw Error(`SpriteSheet non power of 2: ${width}x${height}`)
        }
    }

    // Adjust for new sheet size if necessary:
    checkSheetSize() {
        if (this.nextRow === this.rows) {
            // this.nextCol should be 0
            this.rows = this.usePowerOf2 ? this.rows * 2 : this.rows + 1
            // Resizes ctx preserving it's current image
            util.resizeCtx(this.ctx, this.width, this.height)
            // Recalculate existing sprite uvs.
            util.forLoop(this.sprites, sprite => {
                sprite.uvs = this.getUVs(sprite)
            })
        }
    }
    // Advance nextCol/Row. Done after checkSheetSize enlarged ctx if needed.
    incrementRowCol() {
        this.nextCol += 1
        if (this.nextCol < this.cols) return
        this.nextCol = 0
        this.nextRow += 1
    }

    // Return standard agentscript quad:
    //      3   2
    //      -----
    //      |  /|
    //      | / |
    //      |/  |
    //      -----
    //      0   1
    // I.e. botLeft, botRight, topRight, topLeft
    getUVs(sprite) {
        // note v's are measured from the bottom.
        const { row, col } = sprite
        const { rows, cols } = this
        const u0 = col / cols
        const v0 = (rows - (row + 1)) / rows
        const u1 = (col + 1) / cols
        const v1 = (rows - row) / rows
        // return [[x0, y1], [x1, y1], [x1, y0], [x0, y0]]
        return [u0, v0, u1, v0, u1, v1, u0, v1]
    }
}

export default SpriteSheet

// Return sprite image coords for drawing: x,y,size,size
// getSpriteCoords(sprite) {
//     const { x, y, size } = sprite
//     return { x, y, size }
// }

// Given parameters for a sprite, create a name
// spriteName(shapeName, color, strokeColor = null) {
//     const path = this.shapes.getPath(shapeName)
//     if (!path) throw Error(`spriteName: ${shapeName} not in Shapes`)
//
//     if (path.name === 'imagePath') return `${shapeName}_image`
//
//     if (!color) {
//         throw Error(`spriteName: No color for shape ${shapeName}`)
//     }
//     // OK to give strokeColor when not needed.
//     if (!this.shapes.needsStrokeColor(shapeName)) strokeColor = null
//
//     return `${shapeName}_${color}${strokeColor ? `_${strokeColor}` : ''}`
// }

// id = number of sprites
// get id() {
//     return Object.keys(this.sprites).length
// }
