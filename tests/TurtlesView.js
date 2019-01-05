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
        Object.assign(this, { ctx, world: new World(worldParams) })
        this.shapes = new Shapes()
        this.setTransform(cellSize) // sets this.cellSize
    }

    setTransform(cellSize) {
        this.cellSize = cellSize
        this.world.setCtxTransform(this.ctx, cellSize)
    }

    draw(shape, x, y, theta = 0) {}
}
