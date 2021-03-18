// The Animator runs a function via Promises.
// You can have multiple animators.

export default class Animator {
    constructor(fcn, steps = -1, fps = 30) {
        Object.assign(this, { fcn, steps, fps, timeoutHandle: null })
        this.start()
    }
    start() {
        if (this.timeoutHandle) return // avoid multiple starts
        this.timeoutHandle = setInterval(() => this.step(), 1000 / this.fps)
        // this.timeoutHandle = setInterval(this.step, 1000 / this.fps)
    }
    stop() {
        if (this.timeoutHandle) clearInterval(this.timeoutHandle)
        this.timeoutHandle = null
    }
    step() {
        if (this.steps === 0) return this.stop()
        this.steps--
        this.fcn()
        if (this.stats) this.stats.update()
    }

    startStats() {
        if (this.stats) return console.log('startStats: already running')
        import('https://cdn.skypack.dev/stats.js').then(m => {
            this.stats = new m.default()
            document.body.appendChild(this.stats.dom)
        })
        return this // chaining off ctor
    }

    // Stop and restart with the new fps, no-op if fps not changed
    resetRate(fps) {
        if (fps === this.fps) return
        this.stop()
        this.fps = fps
        this.start()
    }
    // stop if running, start otherwise
    toggle() {
        if (this.timeoutHandle) this.stop()
        else this.start()
    }
    // call the fcn once. stops if currently running
    once() {
        this.stop()
        this.step()
    }
}
