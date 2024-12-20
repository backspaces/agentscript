export default function TwoDrawOptions(div, model, patchSize = 20) {
    const isNode = t => t.breed.name === 'nodes'
    const drawOptions = {
        patchesColor: 'black',
        turtlesColor: t => (isNode(t) ? 'red' : 'random'),
        turtlesShape: t => (isNode(t) ? 'circle' : 'dart'),
        turtlesSize: t => (isNode(t) ? 0.5 : 1.25),
    }

    return { div, patchSize, drawOptions }
}
