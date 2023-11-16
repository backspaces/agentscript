class Mouse {
    /**
     * Create and start mouse obj, args: a model, and a callback method.
     *
     * @param {Canvas|String} canvas The canvas upon which we track the mouse.
     *      If a string is given, get the HTML element by that name
     * @param {world} world World instance
     * @param {Function} callback callback(mouse) called on every mouse action
     */
    // constructor(canvas, world, callback = (evt, mouse) => {}) {
    constructor(model, view, callback) {
        Object.assign(this, { model, view, callback })
        this.canvas = view.canvas
        this.world = model.world

        // callMouseHandler: arrow fnc to insure "this" is mouse.
        this.callMouseHandler = e => this.mouseHandler(e)

        this.isRunning = this.mouseDown = false
        this.x = this.y = this.action = null
        this.setContinuous(false)
    }
    setContinuous(continuous = true) {
        this.continuous = continuous
        return this
    }

    /**
     * Start the mouseListeners.
     * @returns this Return this instance for chaining
     */
    start() {
        // Note: multiple calls safe
        this.canvas.addEventListener('mousedown', this.callMouseHandler)
        if (this.continuous) this.startMouse()
        this.isRunning = true
        return this // chaining
    }

    /**
     * Start the mouseListeners.
     * @returns this Return this instance for chaining
     */
    stop() {
        // Note: multiple calls safe
        this.canvas.removeEventListener('mousedown', this.callMouseHandler)
        this.stopMouse()
        this.isRunning = false
        return this // chaining
    }
    startMouse() {
        document.body.addEventListener('mouseup', this.callMouseHandler)
        this.canvas.addEventListener('mousemove', this.callMouseHandler)
    }
    stopMouse() {
        document.body.removeEventListener('mouseup', this.callMouseHandler)
        this.canvas.removeEventListener('mousemove', this.callMouseHandler)
    }

    mouseHandler(e) {
        if (e.type === 'mousedown') {
            if (!this.continuous) this.startMouse()
            this.mouseDown = true
        }
        if (e.type === 'mouseup') {
            if (!this.continuous) this.stopMouse()
            this.mouseDown = false
        }

        this.action = e.type
        if (e.type === 'mousemove' && this.mouseDown) {
            this.action = 'mousedrag'
        }

        this.setXY(e)
        this.callback(this)
    }

    // set x, y to be event location in turtle coordinates, floats.
    setXY(e) {
        const { canvas, world } = this
        const patchSize = world.patchSize(canvas)
        const rect = this.canvas.getBoundingClientRect()
        const pixX = e.clientX - rect.left
        const pixY = e.clientY - rect.top

        const [x, y] = world.pixelXYtoPatchXY(pixX, pixY, patchSize)
        Object.assign(this, { x, y })
    }
}

export default Mouse
