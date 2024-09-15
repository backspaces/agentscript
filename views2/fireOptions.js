import Color from 'https://code.agentscript.org/src/Color.js'

export default function TwoDrawOptions(div, model, patchSize = 4) {
    const typeColors = {
        dirt: Color.cssToPixel('yellow'),
        tree: Color.cssToPixel('green'),
        fire: Color.cssToPixel('red'),
        ember4: Color.rgbaToPixel(255 - 25, 0, 0),
        ember3: Color.rgbaToPixel(255 - 50, 0, 0),
        ember2: Color.rgbaToPixel(255 - 75, 0, 0),
        ember1: Color.rgbaToPixel(255 - 100, 0, 0),
        ember0: Color.rgbaToPixel(255 - 125, 0, 0),
    }
    const drawOptions = {
        patchesColor: p => typeColors[p.type],
    }

    return { div, patchSize, drawOptions }
}
