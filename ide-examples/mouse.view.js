import * as util from '../src/utils.js'
import Mouse from '../src/Mouse.js'
import TwoDraw from '../src/TwoDraw.js'

const initApp = (MouseModel, divEl) => {
    const model = new MouseModel()
    model.setup()

    const view = new TwoDraw(
        model,
        {
            patchSize: 15,
            drawOptions: {
                patchesColor: 'black',
                linksColor: l => (l === selectedLink ? 'red' : 'gray'),
                linksWidth: 2,
                turtlesShape: 'circle',
                turtlesColor: 'random',
            }
        }
    )

    util.toWindow({ model, view, util })

    let selectedTurtle, selectedLink
    function handleMouse(mouse) {
        const { x, y, action } = mouse
        switch (action) {
            case 'down':
                selectedTurtle = model.turtles.closestTurtle(x, y, 2)
                break
            case 'drag':
                if (selectedTurtle) selectedTurtle.setxy(x, y)
                break
            case 'move':
                selectedLink = model.links.minOneOf(l =>
                    l.distanceXY(x, y)
                )
                break
            case 'up':
                selectedTurtle = null
                break
        }
        view.draw() // Draw whenever mouse has an event
    }

    const mouse = new Mouse(
        view.canvas,
        model.world,
        handleMouse
    ).start()

    view.draw() // Draw once to get started
}

export { initApp }
