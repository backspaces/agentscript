var Model = AS.Model

class MouseModel extends Model {
    population = 20

    // We can use Model's constructor, due to using Model's default World.
    // If you pass in world options, Model will use them
    // constructor() {
    //     super() // use default world options.
    // }

    // Not needed, inherit default world options from Model
    // static worldOptions = World.defaultOptions()

    setup() {
        const { patches, turtles, links } = this
        // this is sorta slick NL use. Can easily be two liner.
        patches.nOf(20).ask(p => p.sprout(1))

        // again, kinda slick, can be broken into a couple of lines.
        turtles.ask(t => links.create(t, turtles.otherOneOf(t)))
    }

    // step() {} .. not needed, will be driven by mouse events
}
const defaultModel = MouseModel

