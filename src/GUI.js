import * as util from '../src/utils.js'
import dat from '../vendor/dat.gui.js'

/** @class */
class GUI {
    /**
     * @param {Object} template A set of name/object pairs, one per UI element
     *
     * @example
     * const gui = new GUI ({
     *     opacity: { // slider
     *         val: [canvas.opacity, [0, 1, 0.1]],
     *         cmd: val => canvas.setOpacity(val),
     *     },
     *     download: { // button
     *         cmd: () => util.downloadBlob(data, 'data.json', false),
     *     },
     *     ...
     * })
     */
    constructor(template) {
        this.template = template

        this.controllers = {}
        this.values = {} // the key/val's from each template

        this.gui = new dat.GUI()
        const guis = [this.gui]

        // this.folders['default'] = this.baseGui

        let newFolder = obj => !obj.val && !obj.cmd
        const parseGuis = obj => {
            util.forLoop(obj, (obj, key) => {
                if (newFolder(obj)) {
                    console.log('new follder', key)

                    this.gui = this.gui.addFolder(key)
                    guis.push(this.gui)
                    parseGuis(obj)
                    guis.pop()
                    this.gui = guis.at(-1)
                } else {
                    this.controllers[key] = this.addUI(obj, key)
                }
            })
        }
        parseGuis(template)

        console.log('controllers, values', this.controllers, this.values, guis)
    }

    type(obj) {
        const { val, cmd } = obj
        const valType = util.typeOf(val)
        const cmdType = util.typeOf(cmd)

        if (this.isDatColor(val)) return 'color'
        if (valType === 'undefined') return 'button'
        // if (val === 'listen') return 'monitor'
        if (valType === 'boolean') return 'toggle'
        if (valType === 'string') return 'input'
        if (valType === 'array' && val.length === 2) {
            if (util.typeOf(val[0]) === 'number') return 'slider'
            if (util.typeOf(val[0]) === 'string') return 'chooser'
            if (util.typeOf(val[0]) === 'object') return 'monitor'
            if (util.typeOf(val[0]) === 'array') return 'monitor'
        }

        throw Error('GUI type error, val: ' + val + ' cmd: ' + cmd)
    }

    /**
     *
     * @param {Object} obj A gui object with two optional objects: 'val' and 'cmd'
     * @param {string} key The name of the gui
     * @returns A dat.gui control object
     */
    addUI(obj, key) {
        let { val, cmd } = obj
        const type = this.type(obj)

        let control, extent

        if (type === 'monitor') cmd = () => val[0][val[1]]
        if (['slider', 'chooser'].includes(type)) [val, extent] = val
        if (type === 'button') val = cmd

        console.log('addUI:', type, key, val, cmd)

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
                control = this.gui.add(this.values, key)
                break

            case 'monitor':
                control = this.gui.add(val[0], val[1])
                break

            default:
                throw Error(`Controller.addUI: bad type: ${type}`)
        }

        // initialize: set model etc initial values to this value
        if (!['monitor', 'button'].includes(type)) cmd(val)
        // if (cmd && val && type !== 'monitor') cmd(val)
        // if (val === 'listen') this.setListener(key, cmd)

        if (cmd) {
            // if (val === 'listen') control.listen().onChange(cmd)
            if (type === 'monitor') control.listen() //.onChange(cmd)
            else control.onChange(cmd)
        }

        return control
    }

    isDatColor(val) {
        if (util.typeOf(val) === 'string') {
            if (val[0] === '#') return val.length === 7 || val.length === 4
            if (val.startsWith('rgb(') || val.startsWith('rgba('))
                return val.endsWith(')')
            if (val.startsWith('hsl(') || val.startsWith('hsla('))
                return val.endsWith(')')
            if (val.startsWith('hsv(') || val.startsWith('hsva('))
                return val.endsWith(')')
        }

        if (util.typeOf(val) === 'object')
            return val.h != null && val.s != null && val.v != null
        // if (util.typeOf(val) === 'array') {
        //     if (val.length === 3 || val.length === 4)
        //         return val.every(i => util.typeOf(i) === 'number')
        // }

        return false
    }
    // setListener(key, cmd) {
    //     this.values[key] = cmd()
    // }
    // update() {
    //     util.forLoop(this.template, (obj, key) => {
    //         if (obj.val === 'listen') this.setListener(key, obj.cmd)
    //     })
    // }
}

export default GUI
