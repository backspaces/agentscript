export default function TwoDrawOptions(div, model, patchSize = 20) {
    const drawOptions = {
        turtlesColor: t => (model.cluster.has(t) ? 'red' : 'random'),
        turtlesShape: 'circle',
        turtlesSize: 2,
        linksColor: 'rgba(255, 255, 255, 0.50',
    }

    return { div, patchSize, drawOptions }
}
