import {Model, util} from '../dist/agentscript.esm.js'

export default class HelloModel extends Model {
    // Inherit default constructor.

    setup() {
        this.turtles.setDefault('atEdge', 'bounce')
        this.turtles.setDefault('speed', 0.1)

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
            t.forward(t.speed)
        })
    }
}

