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
        Object.assign(this, { fcn, steps, fps, timeoutID: null, ticks: 0 })
        this.start()
    }
    /**
     * Starts the model running
     *
     * @returns The animator, allows chaining
     */
    start() {
        if (this.timeoutID) return // avoid multiple starts
        this.timeoutID = setInterval(() => this.step(), 1000 / this.fps)
        return this // chaining off ctor
    }
    /**
     * Stops the model running
     *
     * @returns The animator, allows chaining
     */
    stop() {
        if (this.timeoutID) clearInterval(this.timeoutID)
        this.timeoutID = null
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

    isRunning() {
        return this.timeoutID != null
    }

    startStats(left = '0px') {
        if (this.stats) return console.log('startStats: already running')
        // import('https://cdn.skypack.dev/stats.js').then(m => {
        // import('../vendor/stats.js').then(m => {
        //     this.stats = new m.default()
        //     document.body.appendChild(this.stats.dom)
        //     this.stats.dom.style.left = left
        // })
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
    // Stop and restart with the new steps & fps
    reset(steps = this.steps, fps = this.fps) {
        this.stop()
        this.steps = steps
        this.ticks = 0
        this.fps = fps
        this.start()
    }
    // stop if running, start otherwise
    // if starting and steps === 0, reset with steps = -1, forever.
    toggle() {
        if (this.timeoutID) this.stop()
        else if (this.steps === 0) this.reset()
        else this.start()
    }
    // call the fcn once. stops if currently running
    once() {
        this.stop()
        this.step()
    }
}

export default Animator
