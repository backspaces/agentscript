import ColorMap from 'https://code.agentscript.org/src/ColorMap.js'

export default function TwoDrawOptions(div, model, patchSize = 2) {
    const patchColors = ColorMap.gradientColorMap(256, ['navy', 'aqua'])
    const maxZ = 10
    const drawOptions = {
        // Patches only model:
        patchesColor: p => patchColors.scaleColor(p.zpos, -maxZ, maxZ),
    }

    return { div, patchSize, drawOptions }
}
