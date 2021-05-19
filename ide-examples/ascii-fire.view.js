const initApp = async (Model, divEl) => {
    const model = new Model({
        minX: -30,
        maxX: 30,
        minY: -30,
        maxY: 30
    })
    const width = 1 + model.world.maxX - model.world.minX
    
    await model.startup()
    model.setup()

    const animator = new Animator(() => model.step())

    divEl.style.fontSize = '9px'
    divEl.style.textAlign = 'center'

    // A view just needs a draw() method
    const view = {
        draw: () => {
            // Drawing with text
            // Trees: |, dirt: blank, fire: #, emberN: N, ember0: .
            const char = s => {
                s = s.replace('dirt', ' ')
                s = s.replace('tree', '|')
                s = s.replace('fire', '#')
                s = s.replace('ember', '')
                return s
            }
            
            const patchData = model.patches.props('type')
            const d1 = patchData.map(s => char(s))
            const d1s = d1.join('')
            const regex = new RegExp(`.{${width}}`, 'g')
            let s = d1s.replace(regex, '$&<br />')
            s = s.replace(/[ |#0-9]/g, '$& ')
            s = s.replace(/0/g, '.')
            divEl.innerHTML = `<pre>${s}</pre>`
        }
    }

    return { model, view, animator }
}


export { initApp }
