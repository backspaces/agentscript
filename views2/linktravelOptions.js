export default function TwoDrawOptions(div, model) {
    const isNode = t => t.breed.name === 'nodes'
    const drawOptions = {
        patchesColor: 'black',
        turtlesColor: t => (isNode(t) ? 'red' : 'random'),
        turtlesShape: t => (isNode(t) ? 'circle' : 'dart'),
        turtlesSize: t => (isNode(t) ? 0.5 : 1.25),
    }

    const twoDrawOptions = { div, patchSize: 20, drawOptions }
    return twoDrawOptions
}
