export default function TwoDrawOptions(div, model, patchSize = 20) {
    const drawOptions = {
        turtlesColor: 'yellow',
        turtlesSize: 3,
        turtlesShape: 'bug',
        linksColor: 'red',
        linksWidth: 3,
        // patchesMap: 'Jet',
    }

    return { div, patchSize, drawOptions }
}