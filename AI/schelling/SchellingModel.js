import Model from 'https://agentscript.org/src/Model.js'
import World from 'https://agentscript.org/src/World.js'

export default class SchellingModel extends Model {
    density = 70
    tolerance = 50
    percentHappy = 0

    constructor(worldOptions = World.defaultOptions(25)) {
        super(worldOptions)
    }

    setup() {
        this.patches.ask(p => {
            if (Math.random() * 100 < this.density) {
                p.sprout(1, this.turtles, t => {
                    t.group = Math.random() < 0.5 ? 0 : 1
                })
            }
        })
        this.updateHappy()
    }

    empties() {
        return this.patches.with(p => p.turtlesHere.length === 0)
    }

    isHappy(t) {
        const occupied = t.patch.neighbors.with(n => n.turtlesHere.length > 0)
        if (occupied.length === 0) return true
        const sameCount = occupied.count(n => n.turtlesHere[0].group === t.group)
        return (sameCount / occupied.length) * 100 >= this.tolerance
    }

    updateHappy() {
        const happyCount = this.turtles.count(t => this.isHappy(t))
        this.percentHappy = Math.floor((happyCount / this.turtles.length) * 100)
        this.done = happyCount === this.turtles.length
    }

    step() {
        this.turtles.with(t => !this.isHappy(t)).shuffle().ask(t => {
            t.moveTo(this.empties().oneOf())
        })
        this.updateHappy()
    }
}
