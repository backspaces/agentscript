/**
 * A NetLogo-like mouse handler.
 *
 * **TODO: Example usage.**
 */
class Mouse {
    /**
     * Create and start mouse obj, args: a model, and a callback method.
     *
     * @param {Canvas|String} canvas The canvas upon which we track the mouse.
     *      If a string is given, get the HTML element by that name
     * @param {world} world World instance
     * @param {Function} callback callback(evt, mouse) called on every mouse action
     */
    constructor(canvas, world, callback = (evt, mouse) => {}) {
        if (typeof canvas === 'string') {
            canvas = document.getElementById(canvas)
        }
        Object.assign(this, { canvas, world, callback })

        // instance event handlers: arrow fcns to insure "this" is us.
        // I.e. doesn't work to just use handleXXX in addEventListener.
        this.mouseDown = e => this.handleMouseDown(e)
        this.mouseUp = e => this.handleMouseUp(e)
        this.mouseMove = e => this.handleMouseMove(e)
    }

    resetParams() {
        this.x = this.y = NaN
        this.moved = this.down = false
    }

    /**
     * Start/stop the mouseListeners.  Note that NetLogo's model is to have
     * mouse move events always on, rather than starting/stopping them
     * on mouse down/up.  We may want do make that optional, using the
     * more standard down/up enabling move events.
     * @returns this Return this instance for chaining
     */
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

    get running() {
        return !isNaN(this.x)
    }
    run(on = true) {
        if (on) this.start()
        else this.stop()
    }
    // set run(on = true) {
    //     if (on) this.start()
    //     else this.stop()
    // }
    // toggle() {
    //     if (isNaN(this.x)) this.start()
    //     else this.stop()
    // }

    // Handlers for eventListeners
    generalHandler(e, down, moved) {
        this.down = down
        this.moved = moved
        this.setXY(e)
        this.callback(this, e) // callback generally doesn't use e
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

    // set x, y to be event location in turtle coordinates, floats.
    setXY(e) {
        const { canvas, world } = this
        const patchSize = world.patchSize(canvas)
        const rect = this.canvas.getBoundingClientRect()
        const pixX = e.clientX - rect.left
        const pixY = e.clientY - rect.top

        // const [x, y] = world.pixelXYtoPatchXY(pixX, pixY, patchSize)
        // Object.assign(this, { x, y })
        ;[this.x, this.y] = world.pixelXYtoPatchXY(pixX, pixY, patchSize)
    }
}

export default Mouse
