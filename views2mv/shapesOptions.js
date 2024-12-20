import Shapes from 'https://code.agentscript.org/src/Shapes.js'

// add an image and emoji shapes
const shapes = new Shapes()
await shapes.imagePathPromise(
    'twitter',
    'https://code.agentscript.org/models/data/twitter.png'
)

export default function TwoDrawOptions(div, model, patchSize = 20) {
    shapes.createEmojiPath('tree', 0x1f332)

    function turtleName(t) {
        return shapes.nameAtIndex(t.id)
    }
    const drawOptions = {
        turtlesShape: t => turtleName(t),
        turtlesSize: t => 3,
        turtlesRotate: t => !['lion', 'smiley', 'tree'].includes(turtleName(t)),
    }

    return { div, patchSize, drawOptions }
}

// shapes.createEmojiPath('lion', 0x1f981)
// shapes.createEmojiPath('smiley', 0x1f600)

// await shapes.imagePathPromise(
//     'redfish',
//     'https://code.agentscript.org/models/data/redfish.png'
// )
