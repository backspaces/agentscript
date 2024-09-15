export default function TwoDrawOptions(div, model, patchSize = 6) {
    const drawOptions = {
        patchesColor: p => (p.living ? 'red' : 'rgba(255, 99, 71, 0.2)'),
    }

    return { div, patchSize, drawOptions }
}
