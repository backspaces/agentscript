import util from '../src/util.js'
import World from '../src/World.js'
import Shapes from '../src/Shapes.js'

export default class TurtlesView {
    static rgbColor(r, g, b) {
        return `rgb(${r},${g},${b})`
    }
    static randomColor() {
        const r255 = () => util.randomInt(256) // random int in [0,255]
        return this.rgbColor(r255(), r255(), r255())
    }
    static defaultWorld(maxX, maxY, minX = -maxX, minY = -maxY) {
        return new World({ maxX, maxY, minX, minY })
    }

    constructor(ctx, cellSize, worldParams = {}) {
        // this.world = new World{world}
        // Object.assign(this, { ctx, world: new World(worldParams) })
        this.ctx = ctx
        this.cellSize = cellSize
        this.world = new World(worldParams)
        this.shapes = new Shapes()
        this.setTransform(cellSize) // sets this.cellSize
    }

    getImageBitmap() {
        return createImageBitmap(this.ctx.canvas)
    }

    setTransform(cellSize) {
        this.cellSize = cellSize
        this.world.setCtxTransform(this.ctx, cellSize)
    }

    drawTurtles(data, viewFcn) {
        const isOofA = !util.isArray(data)
        const length = isOofA ? data.x.length : data.length
        util.repeat(length, i => {
            const turtle = isOofA
                ? {
                    x: data.x[i],
                    y: data.y[i],
                    theta: data.theta[i],
                }
                : data[i]
            const { shape, color, size, noRotate } = viewFcn(turtle, i, data)
            this.drawTurtle(turtle, shape, color, size, noRotate)
        })
    }
    drawTurtle(turtle, shape, color, size = 1, noRotate = false) {
        this.shapes.draw(
            this.ctx,
            shape,
            turtle.x,
            turtle.y,
            noRotate ? 0 : turtle.theta,
            size,
            color
        )
    }

    drawLinks(data, viewFcn) {
        const isOofA = !util.isArray(data)
        const length = isOofA ? data.x0.length : data.length
        util.repeat(length, i => {
            const link = isOofA
                ? {
                    x0: data.x0[i],
                    y0: data.y0[i],
                    x1: data.x1[i],
                    y1: data.y1[i],
                }
                : data[i]
            const { color, width } = viewFcn(link, i, data)
            this.drawLink(link, color, width)
        })
    }
    drawLink(link, color, width = 1) {
        this.shapes.drawLine(
            this.ctx,
            link.x0,
            link.y0,
            link.x1,
            link.y1,
            color,
            width
        )
    }
}
