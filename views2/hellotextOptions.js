export default function TwoDrawOptions(div, model, patchSize = 20) {
    const drawOptions = {
        turtlesShape: 'circle',
        turtlesSize: 2, // turtle size in patches
        textProperty: 'id',
        textSize: 0.8, // text size in patches
    }

    const twoDrawOptions = { div, patchSize, drawOptions }
    return twoDrawOptions
}
