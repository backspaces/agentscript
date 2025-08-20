export default function TwoDrawOptions(div, model, patchSize = 6) {
    const drawOptions = {
        patchesColor: p => (p.living ? 'red' : 'black'),
    }

    return { div, patchSize, drawOptions }
}
