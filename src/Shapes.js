import * as util from './utils.js'

function cssColor(color) {
    if (color) return color.css || color
    return color
}

// Shapes are Canvas2D drawings in -0.5 to +0.5, unit squares
// They are drawn on a Canvas2D using transforms for x, y, theta
class Shapes {
    constructor() {
        this.cache = {}
        this.paths = paths // For accessing the paths thru the Shapes instance
    }
    // Add a new path. Error if name already used
    addPath(name, pathFunction) {
        if (this.getPath(name)) Error('addPath: ${name} already defined')
        paths[name] = pathFunction
    }
    // NOTE: convention: if shapeName ends in 2, then needs strokeColor
    needsStrokeColor(shapeName) {
        return shapeName.endsWith('2')
    }

    // Get an array of path names. Can change over time via addPath()
    getPathNames() {
        return Object.keys(paths)
    }
    // Get a path drawing function by name. Returns 'undefined' if not found.
    getPath(name) {
        return paths[name]
    }

    // Return random shape function. It's name is shape.name
    oneOf() {
        // return paths[util.oneValOf(this.getPathNames())]
        return util.oneValOf(paths)
    }

    // Return the name/path at index of path array.
    // Wrap the index to be within the array.
    nameAtIndex(index) {
        const names = this.getPathNames()
        return names[util.mod(index, names.length)]
    }
    atIndex(index) {
        const name = this.nameAtIndex(index)
        return paths[name]
    }

    imagePathPromise(name, imgURL) {
        return util.imagePromise(imgURL).then(img => {
            this.createImagePath(name, img)
        })
    }

    // Create a shape that is an imageable (img, canvas, ...)
    createImagePath(name, img, flip = true) {
        if (!util.isImageable(img)) {
            throw Error('Shapes createImagePath: img not an imageable ' + img)
        }
        if (flip) img = flipImage(img)
        function imagePath(ctx) {
            ctx.drawImage(img, -0.5, -0.5, 1, 1)
        }
        // paths[name] = imagePath
        this.addPath(name, imagePath)
    }

    imageName(name, pixels, fill, stroke) {
        const path = this.getPath(name)
        if (!Number.isInteger(pixels))
            throw Error(`imageName: pixels is not integer: ${name}`)
        if (!path) throw Error(`imageName: ${name} not in Shapes`)

        if (path.name === 'imagePath') return `${name}_${pixels}_image`

        if (!fill) throw Error(`imageName: No color for shape ${name}`)
        // OK to give strokeColor when not needed.
        if (!this.needsStrokeColor(name)) stroke = null

        return `${name}_${pixels}_${fill}${stroke ? `_${stroke}` : ''}`
    }

    shapeToImage(name, pixels, fill, stroke) {
        pixels = Math.ceil(pixels)
        const imgName = this.imageName(name, pixels, fill, stroke)
        if (this.cache && this.cache[imgName]) return this.cache[imgName]

        const ctx = util.createCtx(pixels, pixels)
        ctx.fillStyle = cssColor(fill)
        ctx.strokeStyle = cssColor(stroke)
        ctx.scale(pixels, -pixels)
        ctx.translate(0.5, -0.5)
        ctx.beginPath()
        paths[name](ctx)
        ctx.closePath()
        ctx.fill()

        ctx.canvas.name = imgName
        if (this.cache) this.cache[imgName] = ctx.canvas
        return ctx.canvas
    }

    imageNameToImage(imageName) {
        const [name, pixels, fill, stroke] = imageName.split('_')
        return this.shapeToImage(name, pixels, fill, stroke)
    }
}

// Utilities:
// Flip an image so will be upright in euclidean coords
function flipImage(img) {
    const { width, height } = img
    const ctx = util.createCtx(width, height)
    ctx.scale(1, -1)
    ctx.drawImage(img, 0, -height)
    return ctx.canvas
}
// Centered polygon, x,y in [-1, 1] (size = 2)
function poly(ctx, points) {
    points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt[0], pt[1])
        else ctx.lineTo(pt[0], pt[1])
    })
}
// centered circle
function circle(ctx, x, y, radius, anticlockwise = false) {
    ctx.arc(x, y, radius, 0, 2 * Math.PI, anticlockwise)
}
// centered square
function square(ctx, x, y, size) {
    ctx.fillRect(x - size / 2, y - size / 2, size, size)
}

// The paths object containing shape path procedures for common shapes.
// Paths are unit size, -.5 -> +.5
// Use "addPath()" to add your own new shapes.
//
// These are "upsidedown", i.e. not upright. This is so we can traansform
// to euclidean coords.
// Does not impact most paths. But will impact images & person, person2
const paths = {
    // default(ctx) {
    //     this.dart(ctx)
    // },
    arrow(ctx) {
        poly(ctx, [
            [0.5, 0],
            [0, 0.5],
            [0, 0.2],
            [-0.5, 0.2],
            [-0.5, -0.2],
            [0, -0.2],
            [0, -0.5],
        ])
    },
    bug(ctx) {
        ctx.strokeStyle = ctx.fillStyle
        this.bug2(ctx)
    },
    bug2(ctx) {
        ctx.lineWidth = 0.05
        poly(ctx, [
            [0.4, 0.225],
            [0.2, 0],
            [0.4, -0.225],
        ])
        ctx.stroke()
        ctx.beginPath()
        circle(ctx, 0.12, 0, 0.13)
        circle(ctx, -0.05, 0, 0.13)
        circle(ctx, -0.27, 0, 0.2)
    },
    circle(ctx) {
        // ctx.arc(0, 0, 1, 0, 2 * Math.PI)
        circle(ctx, 0, 0, 0.5)
    },
    dart(ctx) {
        poly(ctx, [
            [0.5, 0],
            [-0.5, 0.4],
            [-0.25, 0],
            [-0.5, -0.4],
        ])
    },
    frame(ctx) {
        const inset = 0.2
        const r = 0.5 - inset
        poly(ctx, [
            [-0.5, -0.5],
            [0.5, -0.5],
            [0.5, 0.5],
            [-0.5, 0.5],
        ]) //cclockwise
        ctx.closePath()
        // reverse direction for non-zero winding rule to leave empty center rect.
        poly(ctx, [
            [-r, -r],
            [-r, r],
            [r, r],
            [r, -r],
        ]) // clockwise
    },
    frame2(ctx) {
        const inset = 0.2
        square(ctx, 0, 0, 1)
        ctx.fillStyle = ctx.strokeStyle
        square(ctx, 0, 0, 1 - 2 * inset) //2 - 2 * inset)
    },
    person(ctx) {
        ctx.strokeStyle = ctx.fillStyle
        this.person2(ctx)
    },
    person2(ctx) {
        poly(ctx, [
            [0.15, 0.2],
            [0.3, 0],
            [0.125, -0.1],
            [0.125, 0.05],
            [0.1, -0.15],
            [0.25, -0.5],
            [0.05, -0.5],
            [0, -0.25],
            [-0.05, -0.5],
            [-0.25, -0.5],
            [-0.1, -0.15],
            [-0.125, 0.05],
            [-0.125, -0.1],
            [-0.3, 0],
            [-0.15, 0.2],
        ])
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.fillStyle = ctx.strokeStyle
        circle(ctx, 0, 0.35, 0.15)
    },
    ring(ctx) {
        const [rOuter, rInner] = [0.5, 0.3]
        circle(ctx, 0, 0, rOuter)
        ctx.lineTo(rInner, 0)
        circle(ctx, 0, 0, rInner, true)
    },
    ring2(ctx) {
        // fileStyle is outer color, strokeStyle inner color
        const [rOuter, rInner] = [0.5, 0.3]
        circle(ctx, 0, 0, rOuter)
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.fillStyle = ctx.strokeStyle
        circle(ctx, 0, 0, rInner)
    },
    square(ctx) {
        square(ctx, 0, 0, 1)
    },
    triangle(ctx) {
        poly(ctx, [
            [0.5, 0],
            [-0.5, -0.4],
            [-0.5, 0.4],
        ])
    },
}

export default Shapes

/*
ToDo:
    - simplify async images: make a "slot" then fill it.
    - manage inversion/upright. Only needed for: person/2, images
    - optimize:
        - cache images .. like spritesheet
        - use shortcuts via the helper functions (avoid transforms)
          See shapes.coffee in as0
    - paths: use object w/ meta-data, & draw(). needsStroke, for example
*/
