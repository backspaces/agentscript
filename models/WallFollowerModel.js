import World from '../src/World.js'
import Model from '../src/Model.js'
import * as util from '../src/utils.js'

// The NetLogo models library wall followers example
// http://ccl.northwestern.edu/netlogo/models/WallFollowingExample
// The key ideas are, for a right hand wall follower:
//
// * Turn right if there is no wall to the right, but there is one
// to the right and behind.
// * Keep turning until there is no wall head
// * Take a step
// * Make sure you are alwas on a patch center
//
// Similarly for left-hand wall followers w/ obvious changes, managed
// by a +/-1 direction turtle variable.

export default class WallFollowerModel extends Model {
    population = 40
    wallPercent = 0.04

    // ======================

    constructor(worldOptions = World.defaultOptions(35)) {
        super(worldOptions)
    }

    setup() {
        this.patchBreeds('walls')
        this.turtleBreeds('lefty righty')

        // righty turtles follow the right hand rule, lefty the left.
        // righty turn right, a negative angle. lefty positive.
        this.righty.setDefault('turn', -1) // -90 degrees
        this.lefty.setDefault('turn', +1) // 90 degrees

        // Have random disks become walls
        this.patches.ask(p => {
            if (util.randomFloat(1) < this.wallPercent) {
                const neighbors = this.patches.inRadius(p, util.randomFloat(3))
                neighbors.ask(n => {
                    n.setBreed(this.walls)
                })
            }
        })
        // Make sure single patch gaps are filled.
        this.patches.edgePatches().ask(p => {
            p.setBreed(this.patches)
        })
        this.patches
            .filter(p => !p.isBreed(this.walls))
            .filter(p => p.neighbors4.every(n => n.isBreed(this.walls)))
            .ask(p => p.setBreed(this.walls))

        // Sprout this.population agents on the non-wall patches.
        this.patches
            .filter(p => !p.isBreed(this.walls))
            .nOf(this.population)
            .ask(p => {
                const breed = util.randomInt(2) ? this.lefty : this.righty
                p.sprout(1, breed, t => {
                    t.face(p.neighbors4.oneOf())
                })
            })
    }

    step() {
        this.turtles.ask(t => {
            this.walk(t)
        })
    }
    walk(t) {
        // Calculate a right turn angle for lefty/righty
        const rtAngle = 90 // Math.PI / 2
        const turnAngle = rtAngle * t.turn

        // Keeps me on the wall when drifting off: If a wall to my west/east and
        // a space to my south west/east, rotate towards wall
        if (!this.wallAt(t, turnAngle) && this.wallAt(t, 1.5 * turnAngle)) {
            t.rotate(turnAngle)
        }
        // Turn Turn left/right if wall is ahead.
        while (this.wallAt(t, 0)) t.rotate(-turnAngle)

        // After all that, move forward, still on patch centers.
        t.forward(1)
    }
    wallAt(t, angle) {
        // Note that angle may be positive or negative.  if angle is
        // positive, the turtle looks right, if negative, left.
        // Return true if wall is ahead.
        const p = t.patchLeftAndAhead(angle, 1)
        return p && p.isBreed(this.walls)
    }
}
