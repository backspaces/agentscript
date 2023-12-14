import Stats from '../vendor/stats.js'

/**
 * Class Animator controls running of a function.
 */
class Animator {
    /**
     * Sets parameters, then calls start().
     * To have the model not start immediately do:
     * - const anim = new Animator(\<args>).stop()
     *
     * @param {Function} fcn The function the animator runs and controls
     * @param {number} steps How many steps to run. Default is -1, forever
     * @param {number} fps Max frames/second to run. Default is 30
     */
    constructor(fcn, steps = -1, fps = 30) {
        Object.assign(this, { fcn, steps, fps, ticks: 0 })

        this.stats = null
        this.timeoutID = null
        this.idle = null
        this.idleFps = null
        this.idleID = null

        this.start()
    }
    /**
     * Starts the model running
     *
     * @returns The animator, allows chaining
     */
    start() {
        // if (this.timeoutID) return // avoid multiple starts
        this.clearIDs()

        this.timeoutID = setInterval(() => this.step(), 1000 / this.fps)
        // if (this.idleID) this.idleID = clearInterval(this.idleID)

        return this // chaining off ctor
    }
    /**
     * Stops the model running
     *
     * @returns The animator, allows chaining
     */
    stop() {
        // if (this.timeoutID) this.timeoutID = clearInterval(this.timeoutID)
        // if (this.idleID) this.idleID = clearInterval(this.idleID)
        this.clearIDs()
        if (this.idle)
            this.idleID = setInterval(() => this.idle(), 1000 / this.idleFps)
        return this // chaining off ctor
    }
    step() {
        // if (this.steps === 0) return this.stop()
        if (this.ticks === this.steps) return this.stop()
        this.ticks++
        // this.steps--
        this.fcn()
        if (this.stats) this.stats.update()
        return this // chaining off ctor
    }

    clearIDs() {
        if (this.timeoutID) this.timeoutID = clearInterval(this.timeoutID)
        if (this.idleID) this.idleID = clearInterval(this.idleID)
    }

    isRunning() {
        return this.timeoutID != null
    }

    startStats(left = '0px') {
        if (this.stats) return console.log('startStats: already running')
        this.stats = new Stats()
        document.body.appendChild(this.stats.dom)
        this.stats.dom.style.left = left

        return this // chaining off ctor
    }

    setFps(fps) {
        this.reset(this.steps, fps)
    }
    setSteps(steps) {
        this.reset(steps, this.fps)
    }
    // set the new steps & fps, restStart if currently running
    reset(steps = this.steps, fps = this.fps) {
        const wasRunning = this.isRunning()
        if (wasRunning) this.stop()
        this.steps = steps
        this.ticks = 0
        this.fps = fps
        if (wasRunning) this.start()
    }
    // stop if running, start otherwise
    // if starting and steps === 0, reset with steps = -1, forever.
    toggle() {
        // if (this.timeoutID) this.stop()
        if (this.isRunning()) this.stop()
        // else if (this.steps === 0) this.reset()
        else this.start()
    }
    // call the fcn once. stops if currently running
    once() {
        this.stop()
        this.step()
    }

    setIdle(fcn, fps = 4) {
        this.idle = fcn
        this.idleFps = fps
    }
}

export default Animator
