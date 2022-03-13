import * as util from '../src/utils.js'
// import dat from 'https://cdn.skypack.dev/dat.gui'
import dat from '../vendor/dat.gui.js'

export default class GUI {
    constructor(template) {
        this.template = template
        this.controllers = {} // not required but may help in debugging
        this.values = {} // the key/val's from each template

        this.gui = new dat.GUI()
        util.forLoop(template, (obj, key) => {
            this.controllers[key] = this.addUI(obj, key)
        })
    }

    type(obj) {
        const { val, cmd } = obj
        const valType = util.typeOf(val)
        const cmdType = util.typeOf(cmd)

        if (this.isDatColor(val)) return 'color'
        if (valType === 'undefined') return 'button'
        if (valType === 'boolean') return 'toggle'
        if (valType === 'string') return 'input'
        if (val === 'listen') return 'monitor'
        if (valType === 'array' && val.length === 2) {
            if (util.typeOf(val[0]) === 'number') return 'slider'
            if (util.typeOf(val[0]) === 'string') return 'chooser'
            throw Error('GUI value type: value error', val)
        }
    }

    addUI(obj, key) {
        console.log(obj, key)
        let { val, cmd } = obj
        const type = this.type(obj)

        let control, extent

        if (util.typeOf(val) === 'array') [val, extent] = val
        if (type === 'button') [val, cmd] = [cmd, val]

        this.values[key] = val

        switch (type) {
            case 'slider':
                const [min, max, step = 1] = extent
                control = this.gui.add(this.values, key, min, max).step(step)
                break

            case 'chooser':
                control = this.gui.add(this.values, key, extent)
                break

            case 'color':
                control = this.gui.addColor(this.values, key)
                break

            case 'button':
            case 'toggle':
            case 'input':
            case 'monitor':
                control = this.gui.add(this.values, key)
                break

            default:
                throw Error(`Controller.addUI: bad type: ${type}`)
        }

        // initialize: set AS values to the GUI vals
        if (cmd && val !== 'listen' && val) cmd(val)
        if (val === 'listen') this.setListener(key, cmd)

        if (cmd) {
            if (val === 'listen') control.listen()
            else control.onChange(cmd)
        }

        return control
    }

    isDatColor(val) {
        if (util.typeOf(val) === 'string') {
            if (val[0] === '#') return val.length === 7 || val.length === 4
            if (val.startsWith('rgb(') || val.startsWith('rgba('))
                return val.endsWith(')')
        }

        // if (util.typeOf(val) === 'object') return val.h && val.s && val.v
        // if (util.typeOf(val) === 'array') {
        //     if (val.length === 3 || val.length === 4)
        //         return val.every(i => util.typeOf(i) === 'number')
        // }

        return false
    }
    setListener(key, cmd) {
        this.values[key] = cmd()
    }
    update() {
        util.forLoop(this.template, (obj, key) => {
            if (obj.val === 'listen') this.setListener(key, obj.cmd)
        })
    }
}
