import World from '../src/World.js'
import Model from '../src/Model.js'

export default class ExitModel extends Model {
    numExits = 10
    population = 0.75 // percent of inside populated

    // ======================

    constructor(worldDptions = World.defaultOptions(35, 35, 1)) {
        super(worldDptions)
    }

    setup() {
        this.patchBreeds('exits inside wall')
        this.turtles.setDefault('atEdge', turtle => turtle.die())

        this.setupPatches()
        this.setupTurtles()
    }
    setupPatches() {
        const { maxX, maxY } = this.world
        this.patches.ask(p => {
            if (Math.abs(p.x) < 0.7 * maxX && Math.abs(p.y) < 0.7 * maxY) {
                p.setBreed(this.inside)
            }
        })
        this.inside.ask(p => {
            p.neighbors4.ask(n => {
                if (n.breed !== this.inside) n.setBreed(this.wall)
            })
        })

        this.wall.nOf(this.numExits).ask((p, i) => {
            p.setBreed(this.exits)
            p.exitNumber = i
        })
    }
    setupTurtles() {
        const turtlePatches = this.inside.nOf(
            this.population * this.inside.length
        )
        turtlePatches.ask(p => {
            p.sprout(1, this.turtles, t => {
                t.exit = this.exits.minOneOf(e => t.distance(e))
                // t.sprite = t.exit.turtleSprite
            })
        })
    }

    step() {
        const emptyNeighbors = turtle =>
            turtle.patch.neighbors.filter(
                n => n.breed !== this.wall && n.turtlesHere.length === 0
            )
        this.turtles.ask(t => {
            if (t.patch.breed === this.inside) {
                const empty = emptyNeighbors(t)
                if (empty.length > 0) {
                    const min = empty.minOneOf(n => n.distance(t.exit))
                    if (t.distance(t.exit) > min.distance(t.exit)) {
                        t.face(min)
                        t.setxy(min.x, min.y)
                    }
                }
            } else {
                t.forward(1)
            }
        })
    }
}
