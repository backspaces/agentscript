import Model from '../src/Model.js'
import util from '../src/util.js'

// =======================================

const defaultOptions = {
    population: 10,
    speed: 0.1,
    wiggle: 0.1,
}

const model = new Model() // default world
Object.assign(model, defaultOptions)

function setup() {
    model.turtles.setDefault('atEdge', 'bounce')

    model.turtles.create(model.population, t => {
        const patch = model.patches.oneOf()
        t.setxy(patch.x, patch.y)
    })

    model.turtles.ask(t => {
        model.links.create(t, model.turtles.otherOneOf(t))
    })
}

function step() {
    model.turtles.ask(t => {
        t.direction += util.randomCentered(model.wiggle)
        t.forward(model.speed)
    })
}

export const TestModule = { startup: model.startup, setup, step, model }

// =======================================

export class TestModel extends Model {
    static defaultOptions() {
        return {
            population: 10,
            speed: 0.1,
            wiggle: 0.1,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, TestModel.defaultOptions())
    }
    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })

        this.turtles.ask(t => {
            this.links.create(t, this.turtles.otherOneOf(t))
        })
    }

    step() {
        this.turtles.ask(t => {
            t.direction += util.randomCentered(this.wiggle)
            t.forward(this.speed)
        })
    }
}
