import util from './util.js'

// Shapes are Canvas2D drawings in -1.0 to +1.0 // Not -0.5 to 0.5.
// They are drawn on a Canvas2D using transforms for x, y, theta
class Shapes {
    constructor() {
        // this.pathNames = Object.keys(paths)
        // this.pathNames = Object.keys(paths).filter(
        //     val => !['poly', 'image'].includes(val)
        // )
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

    // Get a path drawing function by name. Returns 'undefined' if not found.
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

    // Set the ctx.canvas size, and install transform.
    // Note this will clear the canvas!
    resetCtx(ctx, cellSize, width, height, x0 = width / 2, y0 = height / 2) {
        const can = ctx.canvas
        can.width = cellSize * width
        can.height = cellSize * height

        ctx.restore() // in case we've been called before

        ctx.save()
        ctx.scale(cellSize, -cellSize)
        ctx.translate(0, -height)
        ctx.translate(x0, y0)
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
            ctx.drawImage(img, -1, -1, 2, 2)
        }
        // paths[name] = imagePath
        this.addPath(name, imagePath)
    }

    draw(ctx, name, x, y, theta = 0, size = 1, fill, stroke) {
        ctx.save()

        // note: neither may be needed! image needs none, no-stroke only fill.
        ctx.fillStyle = fill
        ctx.strokeStyle = stroke

        ctx.translate(x, y)
        ctx.scale(size / 2, size / 2)
        if (theta !== 0) ctx.rotate(theta)
        ctx.beginPath()
        paths[name](ctx)
        ctx.closePath()
        ctx.fill()

        ctx.restore()
    }

    shapeToImage(name, pixels, fill, stroke) {
        const ctx = util.createCtx(pixels, pixels)
        this.resetCtx(ctx, pixels, 1, 1)
        this.draw(ctx, name, 0, 0, 0, 1, fill, stroke)
        return ctx.canvas
    }

    drawLine(ctx, x0, y0, x1, y1, stroke = 'black', width = 1) {
        // ctx.save() // set identity does a save()
        ctx.strokeStyle = stroke
        ctx.lineWidth = width
        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        util.setIdentity(ctx)
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
    }

    // drawRect(ctx, x, y, width, height, fill = 'red') {
    //     ctx.fillStyle = stroke
    //     ctx.fillRect(x, y, width, height)
    // }
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
// Use "addPath()" to add your own new shapes.
//
// These are "upsidedown", i.e. not upright. This is so we can traansform
// to euclidean coords.
// Does not impact most paths. But will impact images & person, person2
const paths = {
    default(ctx) {
        this.dart(ctx)
    },
    arrow(ctx) {
        poly(ctx, [
            [1, 0],
            [0, 1],
            [0, 0.4],
            [-1, 0.4],
            [-1, -0.4],
            [0, -0.4],
            [0, -1],
        ])
    },
    bug(ctx) {
        ctx.strokeStyle = ctx.fillStyle
        this.bug2(ctx)
    },
    bug2(ctx) {
        ctx.lineWidth = 0.1
        poly(ctx, [[0.8, 0.45], [0.4, 0], [0.8, -0.45]])
        ctx.stroke()
        ctx.beginPath()
        circle(ctx, 0.24, 0, 0.26)
        circle(ctx, -0.1, 0, 0.26)
        circle(ctx, -0.54, 0, 0.4)
    },
    circle(ctx) {
        // ctx.arc(0, 0, 1, 0, 2 * Math.PI)
        circle(ctx, 0, 0, 1)
    },
    dart(ctx) {
        poly(ctx, [[1, 0], [-1, 0.8], [-0.5, 0], [-1, -0.8]])
    },
    frame(ctx) {
        const inset = 0.4
        const r = 1 - inset
        poly(ctx, [[-1, -1], [1, -1], [1, 1], [-1, 1]]) //cclockwise
        ctx.closePath()
        // reverse direction for non-zero winding rule to leave empty center rect.
        poly(ctx, [[-r, -r], [-r, r], [r, r], [r, -r]]) // clockwise
    },
    frame2(ctx) {
        const inset = 0.4
        square(ctx, 0, 0, 2)
        ctx.fillStyle = ctx.strokeStyle
        square(ctx, 0, 0, 2 * (1 - inset)) //2 - 2 * inset)
    },
    // person (ctx) {
    //   this.poly(ctx, [ [0.3, -0.4], [0.6, 0], [0.25, 0.2], [0.25, -0.1],
    //   [0.2, 0.3], [0.5, 1], [0.1, 1], [0, 0.5],
    //   [-0.1, 1], [-0.5, 1], [-0.2, 0.3], [-0.25, -0.1],
    //   [-0.25, 0.2], [-0.6, 0], [-0.3, -0.4]])
    //   ctx.closePath()
    //   ctx.arc(0, -0.7, 0.3, 0, 2 * Math.PI)
    // },
    person(ctx) {
        ctx.strokeStyle = ctx.fillStyle
        this.person2(ctx)
    },
    // person2(ctx) {
    //     this.poly(ctx, [
    //         [0.3, -0.4],
    //         [0.6, 0],
    //         [0.25, 0.2],
    //         [0.25, -0.1],
    //         [0.2, 0.3],
    //         [0.5, 1],
    //         [0.1, 1],
    //         [0, 0.5],
    //         [-0.1, 1],
    //         [-0.5, 1],
    //         [-0.2, 0.3],
    //         [-0.25, -0.1],
    //         [-0.25, 0.2],
    //         [-0.6, 0],
    //         [-0.3, -0.4],
    //     ])
    //     ctx.closePath()
    //     ctx.fill()
    //     ctx.beginPath()
    //     ctx.fillStyle = ctx.strokeStyle
    //     ctx.arc(0, -0.7, 0.3, 0, 2 * Math.PI)
    // },
    person2(ctx) {
        poly(ctx, [
            [0.3, 0.4],
            [0.6, 0],
            [0.25, -0.2],
            [0.25, 0.1],
            [0.2, -0.3],
            [0.5, -1],
            [0.1, -1],
            [0, -0.5],
            [-0.1, -1],
            [-0.5, -1],
            [-0.2, -0.3],
            [-0.25, 0.1],
            [-0.25, -0.2],
            [-0.6, 0],
            [-0.3, 0.4],
        ])
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.fillStyle = ctx.strokeStyle
        circle(ctx, 0, 0.7, 0.3)
    },
    ring(ctx) {
        const [rOuter, rInner] = [1, 0.6]
        circle(ctx, 0, 0, rOuter)
        ctx.lineTo(rInner, 0)
        circle(ctx, 0, 0, rInner, true)
    },
    ring2(ctx) {
        // fileStyle is outer color, strokeStyle inner color
        const [rOuter, rInner] = [1, 0.6]
        circle(ctx, 0, 0, rOuter)
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.fillStyle = ctx.strokeStyle
        circle(ctx, 0, 0, rInner)
    },
    square(ctx) {
        square(ctx, 0, 0, 2)
    },
    triangle(ctx) {
        poly(ctx, [[1, 0], [-1, -0.8], [-1, 0.8]])
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
