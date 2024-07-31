export default function TwoDrawOptions(div, model) {
    const drawOptions = {
        patchesColor: p => (p.living ? 'red' : 'rgba(255, 99, 71, 0.2)'),
    }

    const twoDrawOptions = { div, patchSize: 6, drawOptions }
    return twoDrawOptions
}
