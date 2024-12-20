import Color from 'https://code.agentscript.org/src/Color.js'

export default function TwoDrawOptions(div, model, patchSize = 10) {
    const wallsColor = Color.typedColor(222, 184, 135)
    const backgroundColor = Color.typedColor('black')
    const drawOptions = {
        patchesColor: p =>
            p.breed.name === 'walls' ? wallsColor : backgroundColor,
        turtlesShape: 'dart',
        turtlesSize: 2,
        turtlesColor: t => (t.breed.name === 'lefty' ? 'green' : 'red'),
    }

    return { div, patchSize, drawOptions }
}
