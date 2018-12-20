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

    // Get a path drawing function by name. Returns 'undefined' if not found.
    getPathNames() {
        return Object.keys(paths)
    }
    getPath(name) {
        return paths[name]
    }
    setPath(name, pathFunction) {
        return (paths[name] = pathFunction)
    }

    // Return random shape function. It's name is shape.name
    oneOf() {
        return paths[util.oneValOf(this.simplePathNames)]
    }

    // Set the ctx.canvas size, and install transform.
    // Note this will clear the canvas!
    resetCtx(ctx, cellSize, width, height, x0 = width / 2, y0 = height / 2) {
        const can = ctx.canvas
        can.width = cellSize * width
        can.height = cellSize * height

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
        paths[name] = imagePath
    }

    draw(ctx, name, x, y, cells, theta = 0, fill = 'red', stroke = 'black') {
        ctx.save()

        ctx.fillStyle = fill
        ctx.strokeStyle = stroke

        ctx.translate(x, y)
        ctx.scale(cells / 2, cells / 2)
        ctx.rotate(theta)
        ctx.beginPath()
        paths[name](ctx)
        ctx.closePath()
        ctx.fill()

        ctx.restore()
    }
}

function flipImage(img) {
    const { width, height } = img
    const ctx = util.createCtx(width, height)
    ctx.scale(1, -1)
    ctx.drawImage(img, 0, -height)
    return ctx.canvas
}

const paths = {
    poly(ctx, points = [[1, 0], [-1, 0.8], [-0.5, 0], [-1, -0.8]]) {
        // dart
        points.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt[0], pt[1])
            else ctx.lineTo(pt[0], pt[1])
        })
    },
    default(ctx) {
        this.dart(ctx)
    },
    arrow(ctx) {
        this.poly(ctx, [
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
        this.poly(ctx, [[0.8, 0.45], [0.4, 0], [0.8, -0.45]])
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0.24, 0, 0.26, 0, 2 * Math.PI)
        ctx.arc(-0.1, 0, 0.26, 0, 2 * Math.PI)
        ctx.arc(-0.54, 0, 0.4, 0, 2 * Math.PI)
    },
    circle(ctx) {
        ctx.arc(0, 0, 1, 0, 2 * Math.PI)
    },
    dart(ctx) {
        this.poly(ctx, [[1, 0], [-1, 0.8], [-0.5, 0], [-1, -0.8]])
    },
    frame(ctx) {
        const inset = 0.4
        ctx.fillRect(-1, -1, 2, 2)
        // ctx.fill()
        ctx.clearRect(-1 + inset, -1 + inset, 2 - 2 * inset, 2 - 2 * inset)
        // ctx.fillStyle = 'blue' //'rgba(0,0,0,0)'
        // ctx.fillRect(-1 + inset, -1 + inset, 2 - 2 * inset, 2 - 2 * inset)
    },
    frame2(ctx) {
        const inset = 0.4
        ctx.fillRect(-1, -1, 2, 2)
        // ctx.fill()
        ctx.fillStyle = ctx.strokeStyle
        ctx.fillRect(-1 + inset, -1 + inset, 2 - 2 * inset, 2 - 2 * inset)
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
        this.poly(ctx, [
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
        ctx.arc(0, 0.7, 0.3, 0, 2 * Math.PI)
    },
    ring(ctx) {
        // transparent
        const [rOuter, rInner] = [1, 0.6]
        ctx.arc(0, 0, rOuter, 0, 2 * Math.PI, false)
        ctx.lineTo(rInner, 0)
        ctx.arc(0, 0, rInner, 0, 2 * Math.PI, true)
    },
    ring2(ctx) {
        // fileStyle is outer color, strokeStyle inner color
        const [rOuter, rInner] = [1, 0.6]
        ctx.arc(0, 0, rOuter, 0, 2 * Math.PI) // x, y, r, ang0, ang1, cclockwise
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.fillStyle = ctx.strokeStyle
        ctx.arc(0, 0, rInner, 0, 2 * Math.PI) // x, y, r, ang0, ang1, cclockwise
    },
    square(ctx) {
        ctx.fillRect(-1, -1, 2, 2)
    },
    triangle(ctx) {
        this.poly(ctx, [[1, 0], [-1, -0.8], [-1, 0.8]])
    },
}

export default Shapes
