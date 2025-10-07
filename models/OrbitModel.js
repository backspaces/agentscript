import Model from '/src/Model.js'
import * as util from '/src/utils.js'

// Earth’s radius: 6,371,000 meters (6,371 km)
// LEO height: 200,000 meters (200 km)
// LEO as a percentage of Earth's radius: ~3.14%

let lastGravity = 0

export default class OrbitModel extends Model {
    earthRadius
    LEOHeight
    gravity

    LEORadius
    orbitalVelocity

    // gravity = 0.01 // Adjusted gravity for more realistic orbit
    xPosition = 1 // should be +/- 1
    vDirection = 1 // should be +/- 1

    trail = []
    trailSize = 200

    // ======================

    // constructor() {
    //     super() // use default world options.
    // }

    setLEOHeight(fraction) {
        this.LEOHeight = fraction * this.world.maxX
        this.resetRocket()
    }

    setEarthRadius(fraction) {
        this.earthRadius = fraction * this.world.maxX
        this.resetRocket()
    }

    setGravity(fraction) {
        this.gravity = fraction
        this.resetRocket()
    }

    resetRocket() {
        if (isNaN(this.earthRadius * this.LEOHeight * this.gravity)) return

        this.LEORadius = this.earthRadius + this.LEOHeight
        this.orbitalVelocity = Math.sqrt(this.gravity * this.LEORadius)

        this.rocket.setxy(0, this.xPosition * this.LEORadius)
        this.rocket.vx = this.vDirection * this.orbitalVelocity
        this.rocket.vy = 0
    }

    setNodes() {
        const a1 = this.nodes.createOne(t => t.setxy(0, this.world.maxY))
        const a2 = this.nodes.createOne(t => t.setxy(0, this.world.minY))
        const a3 = this.nodes.createOne(t => t.setxy(this.world.maxX, 0))
        const a4 = this.nodes.createOne(t => t.setxy(this.world.minX, 0))
        this.links.createOne(a1, a2)
        this.links.createOne(a3, a4)
    }

    setup() {
        // why does this fail?
        // this.turtles.setDefault('atEdge', 'bounce')

        this.turtleBreeds('rockets earths trails nodes')

        const earth = this.earths.createOne() // default: located at 0,0
        this.rocket = this.rockets.createOne()
        this.setNodes()

        this.setLEOHeight(0.03)
        this.setEarthRadius(0.2)
        this.setGravity(0.01)
    }

    step() {
        // const rocket = this.rocket
        const { rocket, trail, trailSize } = this

        const distance = Math.sqrt(rocket.x ** 2 + rocket.y ** 2)
        const gravityForce =
            (this.gravity * this.earthRadius ** 2) / distance ** 2

        if (lastGravity !== this.gravity)
            console.log('grav', this.gravity, gravityForce)
        lastGravity = this.gravity

        // Normalize gravity direction
        const ux = -rocket.x / distance
        const uy = -rocket.y / distance

        // Apply gravity acceleration
        rocket.vx += ux * gravityForce
        rocket.vy += uy * gravityForce

        // Update position
        rocket.x += rocket.vx
        rocket.y += rocket.vy

        // add a trail object
        trail.push(this.trails.createOne(t => t.setxy(rocket.x, rocket.y)))
        if (trail.length > trailSize) {
            trail.shift().die() // Limit trail length
        }
    }
}
