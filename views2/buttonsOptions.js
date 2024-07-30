export default function TwoDrawOptions(div, model) {
    const drawOptions = {
        turtlesColor: t => (model.cluster.has(t) ? 'red' : 'random'),
        turtlesShape: 'circle',
        turtlesSize: 2,
        linksColor: 'rgba(255, 255, 255, 0.50',
    }

    const twoDrawOptions = { div, patchSize: 20, drawOptions }
    return twoDrawOptions
}
