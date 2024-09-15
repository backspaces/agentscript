export default function TwoDrawOptions(div, model, patchSize = 50) {
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

    return { div, patchSize, drawOptions }
}
