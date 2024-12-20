import * as util from 'https://code.agentscript.org/src/utils.js'

const baseUrl = 'https://code.agentscript.org/models/data/roads14.png'
const baseMapTile = await util.imagePromise(baseUrl)

export default function TwoDrawOptions(div, model, patchSize = 4) {
    const breedColor = {
        nodes: 'red',
        intersections: 'blue',
        drivers: 'green',
    }
    const breedSize = { nodes: 1, intersections: 2, drivers: 5 }
    const breedShape = {
        nodes: 'circle',
        intersections: 'circle',
        drivers: 'dart',
    }
    const drawOptions = {
        patchesColor: baseMapTile,
        turtlesColor: t => breedColor[t.breed.name],
        turtlesSize: t => breedSize[t.breed.name],
        turtlesShape: t => breedShape[t.breed.name],
        linksColor: 'black',
    }

    return { div, patchSize, drawOptions }
}
