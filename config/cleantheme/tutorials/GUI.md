'color'
'button'
'toggle'
'input'
'slider'
'chooser'
'monitor'

    type(obj) {
        const { val, cmd } = obj
        const valType = util.typeOf(val)
        const cmdType = util.typeOf(cmd)

        if (this.isDatColor(val)) return 'color'
        if (valType === 'undefined') return 'button'
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
