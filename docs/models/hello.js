
import {Model, modelIO, util} from '../dist/agentscript.esm.js'

util.toWindow({ Model, modelIO, util })

class Hello extends Model {
    // Inherit default constructor.

    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(10, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })

        this.turtles.ask(t => {
            this.links.create(t, this.turtles.otherOneOf(t))
        })
    }

    step() {
        this.turtles.ask(t => {
            t.direction += util.randomCentered(0.1)
            t.forward(0.1)
        })
    }
}

const usingPuppeteer = navigator.userAgent === 'Puppeteer'
if (usingPuppeteer) util.randomSeed()

const model = new Hello()
model.setup()

// Debugging
modelIO.printToPage('patches: ' + model.patches.length)
modelIO.printToPage('turtles: ' + model.turtles.length)
modelIO.printToPage('links: ' + model.links.length)
const { world, patches, turtles, links } = model
util.toWindow({ world, patches, turtles, links, model })

// util.repeat(500, () => model.step())
util.yieldLoop(() => model.step(), 500)

modelIO.printToPage('')
modelIO.printToPage(modelIO.sampleObj(model))

if (usingPuppeteer) {
    window.modelDone = model.modelDone = true
    window.modelSample = model.modelSample = modelIO.sampleJSON(model)
}

// if (!usingPuppeteer) runModel()
// else window.runModel = runModel

// const {x, y} = turtles[0]
// modelIO.printToPage('turtle[0](x,y): ' + x + ' ' + y)


