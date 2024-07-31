export default function TwoDrawOptions(div, model) {
    const drawOptions = {
        turtlesShape: 'circle',
        turtlesColor: 'red',
        turtlesSize: 0.5,
        linksColor: 'red',
        patchesMap: 'LightGray',
        textProperty: 'choices',
        textColor: 'white',
        textSize: 0.3,
    }

    const twoDrawOptions = { div, patchSize: 50, drawOptions }
    return twoDrawOptions
}
