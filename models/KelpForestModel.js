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
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })

        this.seaStar.create(this.numSeastar, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })
        this.seaStar.setDefault('atEdge', 'bounce')

        this.urchin.create(this.numUrchin, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })
    }

    day() {
        // days go from 0 to 364
        return this.ticks % 365
    }

    year() {
        // years start at 1
        return Math.floor(this.ticks / 365) + 1
    }

    spawnUrchin() {
        if (this.day() === 0 && this.year() > 1) {
            this.urchin.create(this.urchin.length * 2, t => {
                const patch = this.patches.oneOf()
                t.setxy(patch.x, patch.y)
            })
        }
    }

    reseedKelp() {
        if (this.day() === 0 && this.year() > 1) {
            this.kelp.create(this.kelp.length * 3, t => {
                const patch = this.patches.oneOf()
                t.setxy(patch.x, patch.y)
            })
        }
    }

    spawnSeaStars() {
        if (this.day() === 0 && this.year() > 1) {
            if (this.seaStar.length > 0) {
                this.seaStar.create(2, t => {
                    const patch = this.patches.oneOf()
                    t.setxy(patch.x, patch.y)
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
