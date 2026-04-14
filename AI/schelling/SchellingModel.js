import World from 'https://agentscript.org/src/World.js'
import Model from 'https://agentscript.org/src/Model.js'
import * as util from 'https://agentscript.org/src/utils.js'

export default class SchellingModel extends Model {
    density = 70 // percent of patches occupied by agents (1–99)
    tolerance = 50 // minimum percent of same-group neighbors to be happy (0–100)

    constructor(worldOptions = World.defaultOptions(25)) {
        super(worldOptions)
    }

    setup() {
        this.patches.ask(p => {
            if (util.randomInt(100) < this.density) {
                p.sprout(1, this.turtles, t => {
                    t.group = util.randomInt(2)
                })
            }
        })
        this.updateHappy()
    }

    isHappy(t) {
        const occupied = t.patch.neighbors.with(n => n.turtlesHere.length > 0)
        if (occupied.length === 0) return true
        const sameGroup = occupied.with(n => n.turtlesHere[0].group === t.group)
        return (sameGroup.length / occupied.length) * 100 >= this.tolerance
    }

    updateHappy() {
        const numHappy = this.turtles.count(t => this.isHappy(t))
        this.percentHappy = (numHappy / this.turtles.length) * 100
    }

    step() {
        const unhappy = this.turtles.with(t => !this.isHappy(t))
        if (unhappy.length === 0) {
            this.done = true
            return
        }
        // shuffle empty patches so each unhappy turtle claims a unique one
        const empty = this.patches.with(p => p.turtlesHere.length === 0)
        empty.shuffle()
        let idx = 0
        unhappy.ask(t => {
            if (idx < empty.length) t.moveTo(empty[idx++])
        })
        this.updateHappy()
    }
}
