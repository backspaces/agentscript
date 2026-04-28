import World from 'https://agentscript.org/src/World.js'
import Model from 'https://agentscript.org/src/Model.js'
import * as util from 'https://agentscript.org/src/utils.js'

export default class FooModel extends Model {
    density = 90 //70 // percent of patches occupied by agents (1–99)
    tolerance = 50 // minimum percent of same-group neighbors to be happy (0–100)
    percentHappy = 0

    constructor(worldOptions = World.defaultOptions(25)) {
        super(worldOptions)
    }

    setup() {
        this.turtleBreeds('Xs Os')

        this.patches.ask(p => {
            if (util.randomInt(100) < this.density) {
                const breed = util.randomInt(2) ? this.Xs : this.Os
                p.sprout(1, breed, t => {})
            }
        })

        console.log(
            `Xs: ${this.Xs.length}, Os: ${this.Os.length}, empties: ${this.empties().length}, patches: ${this.patches.length}`
        )
        // this.logEmpties()
    }

    empties() {
        return this.patches.with(p => p.turtlesHere.length === 0)
    }
    // logEmpties() {
    //     // const emptiesIDs = this.empties()
    //     //     .map(p => p.id)
    //     //     .join(' ')
    //     // console.log(this.empties().length, emptiesIDs)
    //     console.log('logEmpties called')
    // }

    isHappy(t) {
        // patches have either 0 or 1 turtles
        const occupied = t.patch.neighbors.with(n => n.turtlesHere.length === 1)
        if (occupied.length === 0) return true // if no one around me, return true

        // find cound of all the neighbors with same breed as me
        const sameCount = occupied.count(
            n => n.turtlesHere[0].breed.name === t.breed.name
        )
        // return true if my count is within tolerance
        return (sameCount / occupied.length) * 100 >= this.tolerance
    }

    step() {
        if (this.done) return

        this.done = true
        let happyCount = 0
        this.turtles.ask(t => {
            if (this.isHappy(t)) {
                happyCount++
            } else {
                // if any turtle unhappy, move to an empty location
                t.moveTo(this.empties().oneOf())
                this.done = false
            }
        })
        this.percentHappy = Math.floor((happyCount / this.turtles.length) * 100)

        if (this.done) {
            console.log('done, ticks:', this.ticks)
            return
        }

        // this.logEmpties()
    }
}
