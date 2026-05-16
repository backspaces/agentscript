const guiTypes = [
    'color',
    'button',
    'input',
    'slider',
    'chooser',
    'monitor',
    'plot',
    'switch',
]

const plotColors = ['red', 'steelblue', 'green', 'orange']

class GUIDiv {
    // layout: 'row' (horizontal, wrapping) or 'column' (vertical)
    // divId: id of the controls div (default: 'controlsDiv')
    // title: optional string — creates a centered title above controls
    // Keys starting with '---' insert a row/column break.
    constructor(
        template,
        { divId = 'controlsDiv', layout = 'row', title = null } = {}
    ) {
        this.template = template
        this.values = {}
        this.monitors = []
        this.plots = []
        this.layout = layout

        // If title given, make body the centering column and prepend the title element
        if (title !== null) {
            Object.assign(document.body.style, {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontFamily: 'sans-serif',
                padding: '16px',
                gap: '8px',
            })
            const titleEl = document.createElement('div')
            Object.assign(titleEl.style, {
                fontSize: '1.4em',
                fontWeight: 'bold',
            })
            titleEl.textContent = title
            document.body.prepend(titleEl)
        }

        // Use the controls div directly as the flex container; create it if absent
        let controlsDiv = document.getElementById(divId)
        if (!controlsDiv) {
            controlsDiv = document.createElement('div')
            controlsDiv.id = divId
            document.body.appendChild(controlsDiv)
        }
        this.container = controlsDiv
        Object.assign(this.container.style, {
            display: 'flex',
            flexDirection: layout === 'column' ? 'column' : 'row',
            flexWrap: layout === 'column' ? 'nowrap' : 'wrap',
            justifyContent: 'center',
            gap: '8px',
            alignItems: layout === 'column' ? 'stretch' : 'center',
            fontFamily: 'sans-serif',
            fontSize: '14px',
        })

        for (const [key, obj] of Object.entries(template)) {
            if (key.startsWith('---')) {
                this.addBreak()
            } else {
                this.addUI(obj, key)
            }
        }

        if (this.monitors.length > 0 || this.plots.length > 0)
            this.startMonitors()
    }

    addBreak() {
        const el = document.createElement('div')
        if (this.layout === 'column') {
            el.style.cssText = 'border-top:1px solid #ccc;margin:2px 0;'
        } else {
            // zero-height 100%-width div forces flex wrap to next row
            el.style.cssText = 'width:100%;height:0;'
        }
        this.container.appendChild(el)
    }

    objType(obj) {
        const keys = Object.keys(obj).filter(k => k !== 'cmd')
        if (keys.length !== 1) return false
        return guiTypes.includes(keys[0]) ? keys[0] : false
    }

    addUI(obj, key) {
        const type = this.objType(obj)
        if (type === false) throw Error('GUIDiv type error: ' + key)

        let val = obj[type]
        const cmd = obj.cmd
        let extent

        if (['slider', 'chooser'].includes(type)) [val, extent] = val
        this.values[key] = val

        if (type === 'button') {
            const el = document.createElement('button')
            el.textContent = key
            el.addEventListener('click', val)
            this.container.appendChild(el)
            return
        }

        const wrap = document.createElement('label')
        wrap.style.cssText = 'display:flex;align-items:center;gap:4px;'
        wrap.appendChild(
            Object.assign(document.createElement('span'), {
                textContent: key + ':',
            })
        )

        switch (type) {
            case 'slider': {
                const [min, max, step = 1] = extent
                const el = document.createElement('input')
                Object.assign(el, { type: 'range', min, max, step, value: val })
                const readout = Object.assign(document.createElement('span'), {
                    textContent: val,
                })
                readout.style.minWidth = '2.5em'
                el.addEventListener('input', () => {
                    const v = parseFloat(el.value)
                    readout.textContent = v
                    cmd(v)
                })
                wrap.append(el, readout)
                if (cmd) cmd(val)
                break
            }

            case 'chooser': {
                const el = document.createElement('select')
                for (const opt of extent) {
                    el.appendChild(
                        Object.assign(document.createElement('option'), {
                            value: opt,
                            textContent: opt,
                            selected: opt === val,
                        })
                    )
                }
                const parse = typeof extent[0] === 'number' ? parseFloat : v => v
                el.addEventListener('change', () => cmd(parse(el.value)))
                wrap.appendChild(el)
                if (cmd) cmd(val)
                break
            }

            case 'color': {
                const el = Object.assign(document.createElement('input'), {
                    type: 'color',
                    value: val,
                })
                el.addEventListener('input', () => cmd(el.value))
                wrap.appendChild(el)
                if (cmd) cmd(val)
                break
            }

            case 'switch': {
                const el = Object.assign(document.createElement('input'), {
                    type: 'checkbox',
                    checked: val,
                })
                el.addEventListener('change', () => cmd(el.checked))
                wrap.appendChild(el)
                break
            }

            case 'input': {
                const el = Object.assign(document.createElement('input'), {
                    type: 'text',
                    value: val,
                })
                el.style.width = '8em'
                el.addEventListener('change', () => cmd(el.value))
                wrap.appendChild(el)
                if (cmd) cmd(val)
                break
            }

            case 'monitor': {
                const [monObj, monKey] = val
                const el = document.createElement('span')
                el.style.fontFamily = 'monospace'
                el.textContent = monObj[monKey]
                wrap.appendChild(el)
                this.monitors.push({ el, obj: monObj, key: monKey })
                break
            }

            case 'plot': {
                // Optional trailing [width, height] numbers: [model,'prop', w, h]
                let srcList = val
                let pw = 200, ph = 50
                if (typeof srcList[srcList.length - 1] === 'number') {
                    ph = srcList[srcList.length - 1]
                    pw = srcList[srcList.length - 2]
                    srcList = srcList.slice(0, -2)
                }
                // Normalize single [model,'prop'] or multi [[m,'p1'],[m,'p2']]
                const sources = Array.isArray(srcList[0]) ? srcList : [srcList]
                const canvas = document.createElement('canvas')
                canvas.width = pw
                canvas.height = ph
                canvas.style.cssText = 'border:1px solid #ccc;background:white;'
                wrap.appendChild(canvas)
                this.plots.push({
                    canvas,
                    sources,
                    data: sources.map(() => []),
                    lastTick: -1,
                })
                break
            }
        }

        this.container.appendChild(wrap)
    }

    startMonitors() {
        const tick = () => {
            for (const { el, obj, key } of this.monitors) {
                el.textContent = obj[key]
            }
            for (const plot of this.plots) {
                const { canvas, sources, data } = plot
                const model = sources[0][0]
                const currentTick = model.ticks
                if (currentTick < plot.lastTick) {
                    for (const d of data) d.length = 0 // restart detected
                }
                if (currentTick !== plot.lastTick) {
                    plot.lastTick = currentTick
                    for (let s = 0; s < sources.length; s++) {
                        const [obj, key] = sources[s]
                        data[s].push(obj[key])
                    }
                    this.drawPlot(canvas, data)
                }
            }
            this._rafId = requestAnimationFrame(tick)
        }
        this._rafId = requestAnimationFrame(tick)
    }

    drawPlot(canvas, data) {
        const W = canvas.width
        const H = canvas.height
        const ctx = canvas.getContext('2d')
        const n = data[0].length
        if (n < 2) return

        ctx.clearRect(0, 0, W, H)

        const allVals = data.flat()
        let yMin = Math.min(...allVals)
        let yMax = Math.max(...allVals)
        if (yMin === yMax) {
            yMin -= 1
            yMax += 1
        }

        // Left margin for y-axis labels
        const ml = 30,
            mr = 4,
            mt = 4,
            mb = 4
        const pw = W - ml - mr
        const ph = H - mt - mb

        ctx.fillStyle = '#888'
        ctx.font = '9px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(yMax.toFixed(0), ml - 2, mt + 9)
        ctx.fillText(yMin.toFixed(0), ml - 2, mt + ph)

        for (let s = 0; s < data.length; s++) {
            const d = data[s]
            ctx.beginPath()
            ctx.strokeStyle = plotColors[s % plotColors.length]
            ctx.lineWidth = 1.5
            for (let i = 0; i < n; i++) {
                const x = ml + (i / (n - 1)) * pw
                const y = mt + ph - ((d[i] - yMin) / (yMax - yMin)) * ph
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
            }
            ctx.stroke()
        }
    }

    open() {
        this.container.style.display = 'flex'
    }
    close() {
        this.container.style.display = 'none'
    }
}

export default GUIDiv
