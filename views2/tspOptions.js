export default function TwoDrawOptions(div, model, patchSize = 6) {
    const drawOptions = {
        patchesColor: 'black',
        turtlesShape: 'circle',
        // turtlesSize of 0 will skip drawing this turle
        // here "travelers" are skipped
        turtlesSize: t => (t.breed.name === 'nodes' ? 2 : 0),
        turtlesColor: 'yellow',
        linksColor: 'red',
    }

    const twoDrawOptions = { div, patchSize, drawOptions }
    return twoDrawOptions
}
