import * as util from 'https://code.agentscript.org/src/utils.js'
import Model from 'https://code.agentscript.org/src/Model.js'

class KelpForestModel extends Model {
    wiggleAngle = 45
    speed = 0.1
    daysInYear = 364
    // year = 0

    numKelp = 500
    numUrchin = 50
    numSeastar = 5

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

        // this.urchin.setDefault("atEdge", "bounce");

        // this.urchin.speed = 0.1

        // this.updateTicks = () => {
        //     this.tickCounter++
        //     if (this.tickCounter >= 366) {
        //         this.tickCounter = 0
        //     }
        // }

        // this.spawnUrchin = function spawnUrchin(tickCounter) {
        //     if (tickCounter >= 365) {
        //         this.urchin.create(this.urchin.length * 2, t => {
        //             const patch = this.patches.oneOf()
        //             t.setxy(patch.x, patch.y)
        //         })
        //     }
        // }

        // this.reseedKelp = function reseedKelp(tickCounter) {
        //     if (tickCounter >= 365) {
        //         this.kelp.create(this.kelp.length * 3, t => {
        //             const patch = this.patches.oneOf()
        //             t.setxy(patch.x, patch.y)
        //         })
        //     }
        // }

        // this.spawnSeaStars = function spawnSeaStars(tickCounter) {
        //     if (this.seaStar.length > 0) {
        //         if (tickCounter >= 365) {
        //             this.seaStar.create(2, t => {
        //                 const patch = this.patches.oneOf()
        //                 t.setxy(patch.x, patch.y)
        //             })
        //         }
        //     }
        // }
    }

    isNewYear() {
        return this.ticks % this.daysInYear === this.daysInYear - 1
    }

    spawnUrchin() {
        if (this.isNewYear()) {
            this.urchin.create(this.urchin.length * 2, t => {
                const patch = this.patches.oneOf()
                t.setxy(patch.x, patch.y)
            })
        }
    }

    reseedKelp() {
        if (this.isNewYear()) {
            this.kelp.create(this.kelp.length * 3, t => {
                const patch = this.patches.oneOf()
                t.setxy(patch.x, patch.y)
            })
        }
    }

    spawnSeaStars() {
        if (this.seaStar.length > 0) {
            if (this.isNewYear()) {
                this.seaStar.create(2, t => {
                    const patch = this.patches.oneOf()
                    t.setxy(patch.x, patch.y)
                })
            }
        }
    }

    step() {
        // if (this.done) {
        //     console.log('done, ticks =', this.ticks)
        //     return
        // }

        this.urchin.ask(t => {
            let closestSeaStar = false
            if (this.seaStar.length > 0) {
                closestSeaStar = this.seaStar.minOneOf(seaStar =>
                    t.distance(seaStar)
                )
            }

            if (closestSeaStar && t.distance(closestSeaStar <= 2)) {
                const seaStarHeading = closestSeaStar.heading
                t.heading = seaStarHeading * -1
                t.forward(this.speed)
            } else {
                t.heading += util.randomCentered(this.wiggleAngle)
                t.forward(this.speed)
            }
        })

        this.seaStar.ask(t => {
            let closestUrchin = false
            if (this.urchin.length > 0) {
                closestUrchin = this.urchin.minOneOf(urchin =>
                    t.distance(urchin)
                )
            }

            if (closestUrchin && t.distance(closestUrchin) <= 2) {
                t.face(closestUrchin)
                t.forward(this.speed)
            } else {
                t.heading += util.randomCentered(this.wiggleAngle)
                t.forward(this.speed)
            }
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

        // this.done = this.ticks === this.daysInYear * 5
    }

    // clearTurtles() {
    //     this.urchin.clear()
    //     this.kelp.clear()
    //     this.seaStar.clear()
    // }
}

export default KelpForestModel
