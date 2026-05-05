const guiTypes = [
    'color',
    'button',
    'input',
    'slider',
    'chooser',
    'monitor',
    'switch',
]

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

        if (this.monitors.length > 0) this.startMonitors()
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
                el.addEventListener('change', () => cmd(el.value))
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
        }

        this.container.appendChild(wrap)
    }

    startMonitors() {
        const tick = () => {
            for (const { el, obj, key } of this.monitors) {
                el.textContent = obj[key]
            }
            this._rafId = requestAnimationFrame(tick)
        }
        this._rafId = requestAnimationFrame(tick)
    }

    open() {
        this.container.style.display = 'flex'
    }
    close() {
        this.container.style.display = 'none'
    }
}

export default GUIDiv
