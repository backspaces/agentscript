import Model from '../src/Model.js'
import * as modelIO from '../src/modelIO.js'
import util from '../src/util.js'

util.toWindow({ Model, modelIO, util })

class ExitModel extends Model {
    setup() {
        this.patchBreeds('exits inside wall')
        this.turtles.setDefault('shape', 'circle')
        this.turtles.setDefault('atEdge', turtle => turtle.die())

        this.numExits = 10
        this.population = 0.75 // percent of inside populated

        // this.anim.setRate(10)

        // this.inside.setDefault('color', )

        this.setupPatches()
        this.setupTurtles()
    }
    setupPatches() {
        // const grays = ColorMap.LightGray
        // const basic16 = ColorMap.Basic16

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

        // REMIND: use setDefault
        // this.patches.ask(p => { p.color = grays.randomColor() })
        // this.inside.ask(p => { p.color = basic16.closestColor(0, 0, 0) }) // black
        // this.wall.ask(p => { p.color = basic16.closestColor(127, 127, 127) }) // gray
        this.wall.nOf(this.numExits).ask(p => {
            p.setBreed(this.exits)
            // p.setColor(basic16[this.exits.length + 4])
        })
    }
    setupTurtles() {
        // const ss = this.spriteSheet

        // this.exits.ask(e => { e.turtleSprite = ss.newSprite('circle', e.color) })

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
                n => n.breed !== this.wall && n.turtlesHere().length === 0
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

const usingPuppeteer = navigator.userAgent === 'Puppeteer'
if (usingPuppeteer) util.randomSeed()

const options = Model.defaultWorld(35)
const model = new ExitModel(options)
model.setup()

// Debugging:
modelIO.printToPage('patches: ' + model.patches.length)
modelIO.printToPage('turtles: ' + model.turtles.length)
modelIO.printToPage('links: ' + model.links.length)
const { world, patches, turtles, links, exits, inside, wall } = model
util.toWindow({ world, patches, turtles, links, exits, inside, wall, model })

// util.repeat(500, () => model.step())
util.yieldLoop(() => model.step(), 500)

modelIO.printToPage('')
modelIO.printToPage('turtles: ' + model.turtles.length)

modelIO.printToPage('')
modelIO.printToPage(modelIO.sampleObj(model))

if (usingPuppeteer) {
    window.modelDone = model.modelDone = true
    window.modelSample = model.modelSample = modelIO.sampleJSON(model)
}
