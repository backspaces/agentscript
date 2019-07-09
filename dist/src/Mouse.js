// A NetLogo-like mouse handler.
export default class Mouse {
    // Create and start mouse obj, args: a model, and a callback method.
    constructor(canvas, world, callback = evt => {}) {
        if (typeof canvas === 'string') {
            canvas = document.getElementById(canvas)
        }
        Object.assign(this, { canvas, world, callback })

        // instance event handlers: arrow fcns to insure "this" is us.
        this.mouseDown = e => this.handleMouseDown(e)
        this.mouseUp = e => this.handleMouseUp(e)
        this.mouseMove = e => this.handleMouseMove(e)

        // this.start()
    }

    // Start/stop the mouseListeners.  Note that NetLogo's model is to have
    // mouse move events always on, rather than starting/stopping them
    // on mouse down/up.  We may want do make that optional, using the
    // more standard down/up enabling move events.
    resetParams() {
        this.xCor = this.yCor = NaN
        this.moved = this.down = false
    }
    start() {
        // Note: multiple calls safe
        this.canvas.addEventListener('mousedown', this.mouseDown)
        document.body.addEventListener('mouseup', this.mouseUp)
        this.canvas.addEventListener('mousemove', this.mouseMove)
        this.resetParams()
        return this // chaining
    }
    stop() {
        // Note: multiple calls safe
        this.canvas.removeEventListener('mousedown', this.mouseDown)
        document.body.removeEventListener('mouseup', this.mouseUp)
        this.canvas.removeEventListener('mousemove', this.mouseMove)
        this.resetParams()
        return this // chaining
    }

    // Handlers for eventListeners
    generalHandler(e, down, moved) {
        this.down = down
        this.moved = moved
        this.setXY(e)
        this.callback(e)
    }
    handleMouseDown(e) {
        this.action = 'down'
        this.generalHandler(e, true, false)
    }
    handleMouseUp(e) {
        this.action = 'up'
        this.generalHandler(e, false, false)
    }
    handleMouseMove(e) {
        this.action = this.down ? 'drag' : 'move'
        this.generalHandler(e, this.down, true)
    }

    // Event locations, clientX/Y, screenX/Y, offsetX/Y, pageX/Y .. confusing!
    // Stack Overflowhttps://tinyurl.com/y5k9rwhb

    // set x, y to be event location in patch coordinates.
    setXY(e) {
        const rect = this.canvas.getBoundingClientRect()
        const pixX = e.clientX - rect.left
        const pixY = e.clientY - rect.top
        // return this.pixelXYtoPatchXY(pixX, pixY)
        // const xy = this.pixelXYtoPatchXY(pixX, pixY)
        // [this.xCor, this.yCor] = xy // this.pixelXYtoPatchXY(pixX, pixY)
        Object.assign(this, this.pixelXYtoPatchXY(pixX, pixY))
    }

    patchSize() {
        const { numX, numY } = this.world
        const { clientWidth: width, clientHeight: height } = this.canvas
        const xSize = width / numX
        const ySize = height / numY
        if (xSize !== ySize) {
            throw Error(
                `Mouse patchSize: xSize, ySize differ ${xSize}, ${ySize}`
            )
        }
        return xSize
    }

    // Convert pixel location (top/left offset i.e. mouse)
    // to patch coords(float)
    pixelXYtoPatchXY(x, y) {
        const patchSize = this.patchSize()
        const { minXcor, maxYcor } = this.world
        return {
            xCor: minXcor + x / patchSize,
            yCor: maxYcor - y / patchSize,
        }
    }
    pixelXYtoPatchIndex(x, y) {
        x = Math.round(x)
        y = Math.round(y)
        const { minX, maxY, numX } = this.world
        return x - minX + numX * (maxY - y)
    }

    // Convert patch coords (float) to pixel location
    // (top / left offset i.e.mouse)
    // patchXYtoPixelXY(x, y) {
    //     return [(x - this.minXcor) * this.size, (this.maxYcor - y) * this.size]
    // }
}
