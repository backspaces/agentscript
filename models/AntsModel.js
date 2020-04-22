import World from '../src/World.js'
import Model from '../src/Model.js'
import util from '../src/util.js'

export default class AntsModel extends Model {
    static defaultOptions() {
        return {
            population: 255,
            speed: 1.0,
            maxPheromone: 35,
            diffusionRate: 0.3,
            evaporationRate: 0.01,
            wiggleAngle: util.radians(30),
        }
    }

    // ======================

    constructor(worldOptions = World.defaultOptions(40)) {
        super(worldOptions)
        Object.assign(this, AntsModel.defaultOptions())
    }

    setup() {
        this.turtles.setDefault('atEdge', 'bounce')
        this.setupPatches()
        this.setupTurtles()
    }
    setupPatches() {
        this.patches.ask(p => {
            p.isNest = p.isFood = false
            p.nestPheromone = p.foodPheromone = 0
        })
        const { maxX, minX } = this.world
        this.patches.patchRectXY(maxX - 6, 0, 3, 3).ask(p => {
            p.isNest = true
        })
        this.patches.patchRectXY(minX + 6, 0, 3, 3).ask(p => {
            p.isFood = true
        })
    }
    setupTurtles() {
        this.turtles.create(this.population, t => {
            t.setxy(this.world.maxX - 6, 0)
            this.resetTurtle(t, false) // sets t.pheromone to max
        })
    }
    resetTurtle(t, withFood) {
        t.carryingFood = withFood
        t.pheromone = this.maxPheromone
    }

    step() {
        this.updateTurtles()
        this.updatePatches()
    }
    updateTurtles() {
        this.turtles.ask(t => {
            if (t.id >= this.ticks) return // slowly release ants
            this.wiggleUphill(t)
            this.dropPheromone(t)
        })
    }

    wiggleUphill(t) {
        const p = t.patch
        if (p.isOnEdge()) {
            t.rotate(Math.PI)
        } else {
            const nAhead = p.neighbors.inCone(p, 2, Math.PI, t.theta)
            const pheromone = t.carryingFood ? 'nestPheromone' : 'foodPheromone'
            const [n, max] = nAhead.maxValOf(pheromone)
            if (max > 0.001 / this.maxPheromone) t.face(n)
        }
        t.rotate(util.randomCentered(this.wiggleAngle))
        t.forward(this.speed)
    }
    dropPheromone(t) {
        const p = t.patch
        if ((!t.carryingFood && p.isFood) || (t.carryingFood && p.isNest)) {
            this.resetTurtle(t, !t.carryingFood)
        }
        const pheromone = t.carryingFood ? 'foodPheromone' : 'nestPheromone'
        p[pheromone] += 0.1 * t.pheromone
        t.pheromone *= 0.9
    }

    updatePatches() {
        this.patches.diffuse('nestPheromone', this.diffusionRate)
        this.patches.diffuse('foodPheromone', this.diffusionRate)
        this.patches.ask(p => {
            p.foodPheromone *= 1 - this.evaporationRate
            p.nestPheromone *= 1 - this.evaporationRate
        })
    }
}
