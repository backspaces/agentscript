import * as util from '../src/utils.js'
import dat from '../vendor/dat.gui.js'

const guiTypes = [
    'color',
    'button',
    'input',
    'slider',
    'chooser',
    'monitor',
    'switch',
]

/** @class */
class GUI {
    /**
     * @param {Object} template A set of name/object pairs, one per UI element
     *
     * @example
     * const gui = new GUI ({
     *     opacity: {
     *         slider: [canvas.opacity, [0, 1, 0.1]],
     *         cmd: val => canvas.setOpacity(val),
     *     },
     *     download: {
     *         button: () => util.downloadBlob(data, 'data.json', false),
     *     },
     *     ...
     * })
     */
    // the default width is 245. You can change it via width below
    constructor(template, width = null) {
        this.template = template

        this.controllers = {}
        this.values = {} // the key/val's from each template

        this.gui = new dat.GUI()
        if (width) this.gui.width = width
        const guis = [this.gui]

        const parseGuis = obj => {
            util.forLoop(obj, (obj, key) => {
                if (this.isFolder(obj)) {
                    console.log('new folder', obj, key)
                    this.gui = this.gui.addFolder(key)
                    guis.push(this.gui)
                    parseGuis(obj)
                    guis.pop()
                    this.gui = guis.at(-1)
                } else {
                    // console.log('new ui', obj, key)
                    // obj.type = this.objType(obj)
                    this.controllers[key] = this.addUI(obj, key)
                }
            })
        }
        parseGuis(template)

        console.log('controllers, values', this.controllers, this.values, guis)
    }

    objType(obj) {
        let keys = Object.keys(obj)
        keys = keys.filter(elem => elem !== 'cmd')
        if (keys.length != 1) return false
        const key = keys[0]
        return guiTypes.includes(key) ? key : false
    }
    isFolder(obj) {
        return this.objType(obj) === false
    }

    // /**
    //  *
    //  * @param {Object} obj A gui object with two optional objects: 'val' and 'cmd'
    //  * @param {string} key The name of the gui
    //  * @returns A dat.gui control object
    //  */
    addUI(obj, key) {
        const type = this.objType(obj)
        if (type === false) throw Error('GUI type error:' + obj)

        let val = obj[type]
        let cmd = obj.cmd

        let control, extent

        if (type === 'monitor') cmd = () => val[0][val[1]]
        if (type === 'button') cmd = val
        if (['slider', 'chooser'].includes(type)) [val, extent] = val

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
            case 'switch':
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
        if (!['monitor', 'button', 'switch'].includes(type)) cmd(val)

        if (cmd) {
            // if (val === 'listen') control.listen().onChange(cmd)
            if (type === 'monitor') {
                control.listen() //.onChange(cmd)}
            } else {
                control.onChange(cmd)
            }
        }

        return control
    }
    // updateGui(name, value) {
    //     console.log('updateGui name, value', name, value)
    // }
}

export default GUI
