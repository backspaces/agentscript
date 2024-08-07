export default function TwoDrawOptions(div, model, patchSize = 10) {
    const turtleColors = {
        infected: 'red',
        susceptible: 'blue',
        resistant: 'gray',
    }
    const drawOptions = {
        patchesColor: 'black',
        turtlesShape: 'circle',
        turtlesSize: 1.5,
        turtlesColor: t => turtleColors[t.state],
        linksColor: 'rgba(255, 255, 255, 0.50',
    }

    const twoDrawOptions = { div, patchSize, drawOptions }
    return twoDrawOptions
}
