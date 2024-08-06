import Shapes from 'https://code.agentscript.org/src/Shapes.js'

export default async function TwoDrawOptions(div, model, patchSize = 20) {
    const shapes = new Shapes()

    await shapes.imagePathPromise(
        'twitter',
        'https://code.agentscript.org/models/data/twitter.png'
    )
    await shapes.imagePathPromise(
        'redfish',
        'https://code.agentscript.org/models/data/redfish.png'
    )
    shapes.createEmojiPath('lion', 0x1f981)
    shapes.createEmojiPath('smiley', 0x1f600)
    shapes.createEmojiPath('tree', 0x1f332)

    ////

    function turtleName(t) {
        return shapes.nameAtIndex(t.id)
    }
    const drawOptions = {
        turtlesShape: t => turtleName(t),
        turtlesSize: t => (turtleName(t) === 'redfish' ? 5 : 3),
        turtlesRotate: t => !['lion', 'smiley', 'tree'].includes(turtleName(t)),
    }

    const twoDrawOptions = { div, patchSize, drawOptions }
    return twoDrawOptions
}
