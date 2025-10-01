import * as util from 'https://code.agentscript.org/src/utils.js'
import World from 'https://code.agentscript.org/src/World.js'
import Model from 'https://code.agentscript.org/src/Model.js'

// util.randomSeed() // causes each run to have same results for debugging

class KelpForestModel extends Model {
    wiggleAngle = 45
    speed = 0.1

    numKelp = 500
    numUrchin = 50
    numSeastar = 5

    // worldOptions: patches -16, 16 or 33 x 33 with 0,0 origin
    constructor(worldOptions = World.defaultOptions(16)) {
        super(worldOptions)
    }

    setup() {
        this.turtleBreeds('kelp urchin seaStar')

        this.kelp.create(this.numKelp, t => {
            t.moveTo(this.patches.oneOf())
        })

        this.seaStar.create(this.numSeastar, t => {
            t.moveTo(this.patches.oneOf())
        })
        this.seaStar.setDefault('atEdge', 'bounce')

        this.urchin.create(this.numUrchin, t => {
            t.moveTo(this.patches.oneOf())
        })
    }

    // we pass ticks as an option defaulting to the model's ticks.
    // this allows us to use them from the animator and other environments.
    // or outside of step() where this.ticks is off by one.
    day(ticks = this.ticks) {
        // days go from 0 to 364
        return ticks % 365
    }
    year(ticks = this.ticks) {
        // years start at 1
        return 1 + Math.floor(ticks / 365)
    }

    spawnUrchin() {
        if (this.day() === 0 && this.year() > 1) {
            this.urchin.create(this.urchin.length * 2, t => {
                t.moveTo(this.patches.oneOf())
            })
        }
    }

    reseedKelp() {
        if (this.day() === 0 && this.year() > 1) {
            this.kelp.create(this.kelp.length * 3, t => {
                t.moveTo(this.patches.oneOf())
            })
        }
    }

    spawnSeaStars() {
        if (this.day() === 0 && this.year() > 1) {
            if (this.seaStar.length > 0) {
                this.seaStar.create(2, t => {
                    t.moveTo(this.patches.oneOf())
                })
            }
        }
    }

    closestNeighbor(turtle, neighbors) {
        let closest = false
        if (neighbors.length > 0) {
            closest = neighbors.minOneOf(t => t.distance(turtle))
        }
        return closest
    }

    step() {
        // console.log('year', this.year())

        this.urchin.ask(t => {
            const closestSeaStar = this.closestNeighbor(t, this.seaStar)

            if (closestSeaStar && t.distance(closestSeaStar <= 2)) {
                const seaStarHeading = closestSeaStar.heading
                t.heading = seaStarHeading * -1
            } else {
                t.heading += util.randomCentered(this.wiggleAngle)
            }
            t.forward(this.speed)
        })

        this.seaStar.ask(t => {
            const closestUrchin = this.closestNeighbor(t, this.urchin)

            if (closestUrchin && t.distance(closestUrchin) <= 2) {
                t.face(closestUrchin)
            } else {
                t.heading += util.randomCentered(this.wiggleAngle)
            }
            t.forward(this.speed)
        })

        this.urchin.forEach(t => {
            const kelpHere = this.kelp.filter(kelp => kelp.patch === t.patch)
            kelpHere.forEach(kelp => kelp.die())

            const seaStarHere = this.seaStar.filter(
                seaStar => seaStar.patch === t.patch
            )
            if (seaStarHere.length > 0) {
                t.die()
            }
        })

        this.spawnUrchin()
        this.reseedKelp()
        this.spawnSeaStars()
    }
}

export default KelpForestModel
