export default class Animator {
    constructor(fcn, steps = -1, fps = 30) {
        Object.assign(this, { fcn, steps, fps, timeoutID: null })
        this.start()
    }
    start() {
        if (this.timeoutID) return // avoid multiple starts
        this.timeoutID = setInterval(() => this.step(), 1000 / this.fps)
        return this // chaining off ctor
    }
    stop() {
        if (this.timeoutID) clearInterval(this.timeoutID)
        this.timeoutID = null
        return this // chaining off ctor
    }
    step() {
        if (this.steps === 0) return this.stop()
        this.steps--
        this.fcn()
        if (this.stats) this.stats.update()
        return this // chaining off ctor
    }

    startStats() {
        if (this.stats) return console.log('startStats: already running')
        import('https://cdn.skypack.dev/stats.js').then(m => {
            this.stats = new m.default()
            document.body.appendChild(this.stats.dom)
        })
        return this // chaining off ctor
    }

    // Stop and restart with the new steps & fps
    reset(steps = -1, fps = this.fps) {
        this.stop()
        this.steps = steps
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
