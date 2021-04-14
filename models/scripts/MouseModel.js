var Model = AS.Model

class MouseModel extends Model {
    population = 20
    // constructor not needed, using default ctor & population defined here
    setup() {
        const { patches, turtles, links } = this
        // this is sorta slick NL use. Can easily be two liner.
        patches.nOf(20).ask(p => p.sprout(1))

        // again, kinda slick, can be broken into a couple of lines.
        turtles.ask(t => links.create(t, turtles.otherOneOf(t)))
    }
    // step() {} .. not needed, driven by mouse
}
const defaultModel = MouseModel

