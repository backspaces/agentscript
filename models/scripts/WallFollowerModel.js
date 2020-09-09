// import ColorMap from '../src/ColorMap.js'
var World = AS.World
var Model = AS.Model
var util = AS.util

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

class WallFollowerModel extends Model {
    static defaultOptions() {
        return {
            population: 40,
            wallPercent: 0.04,
        }
    }

    // ======================

    constructor(worldDptions = World.defaultOptions(35)) {
        super(worldDptions)
        Object.assign(this, WallFollowerModel.defaultOptions())
    }

    setup() {
        // this.refreshPatches = false
        this.population = 40
        // this.anim.setRate(10)

        this.patchBreeds('walls')
        this.turtleBreeds('lefty righty')
        // REMIND: we don't allow setting default patch colors: raster not property.
        // this.walls.setDefault('color', [222, 184, 135])

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
    walk(turtle) {
        // Calculate a right turn angle for lefty/righty
        const rtAngle = Math.PI / 2
        const turnAngle = rtAngle * turtle.turn

        // Keeps me on the wall when drifting off: If a wall to my west/east and
        // a space to my south west/east, rotate towards wall
        if (
            !this.wallAt(turtle, turnAngle) &&
            this.wallAt(turtle, 1.5 * turnAngle)
        ) {
            turtle.rotate(turnAngle)
        }
        // Turn Turn left/right if wall is ahead.
        while (this.wallAt(turtle, 0)) turtle.rotate(-turnAngle)

        // After all that, move forward, still on patch centers.
        turtle.forward(1)
    }
    wallAt(turtle, angle) {
        // Note that angle may be positive or negative.  if angle is
        // positive, the turtle looks right, if negative, left.
        // Return true if wall is ahead.
        const p = turtle.patchLeftAndAhead(angle, 1)
        return p && p.isBreed(this.walls)
    }
}
const defaultModel = WallFollowerModel

