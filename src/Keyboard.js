class Keyboard {
    /**
     * Creates an instance of Keyboard.
     * The objects in the keyModObjs look like:
     *
     * @constructor
     * @param {Object[]} Commands array of keyboard command objects
     * @param {String} ModifierKey default modifier key(alt, shift, ..)
     *
     * @example
     * // A command object looks like:
     * {
     *     key: 's',
     *     cmd: () => anim.start(),
     *     modifier: 'alt', // if messing, use the constructor's default modifier
     * }
     *
     *
     * @example
     * // The array of keyboard commands looks like:
     *  const keyCommands = [
     *      // These use the default modifier key, in this case the 'alt' key
     *      { key: 'q', cmd: () => console.log('q') },
     *      { key: '2', cmd: () => console.log('2') },
     *      { key: 'F2', cmd: () => console.log('F2') },
     *      { key: 'ArrowDown', cmd: () => console.log('ArrowDown') },
     *      { key: 'Escape', cmd: () => console.log('Escape') },
     *      // Here we override the default modifier key
     *      { modifier: 'shiftKey', key: 'a', cmd: () => console.log('shift A') },
     *      { modifier: 'None', key: 'b', cmd: () => console.log('b') },
     *      { modifier: '', key: 'c', cmd: () => console.log('c') }
     *  ]
     *  const keyboard = new Keyboard(keyCommands, 'alt')
     */

    // default is no modifier
    constructor(keyModObjs, defaultModifier) {
        const modifiers = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']
        const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

        // this.processAllKeys = keyModObjs.length = 0
        // Use {key: 'all', cmd: xxx} to grab all events

        const keymods = {}
        keyModObjs.forEach(obj => {
            let { modifier, key, cmd } = obj

            if (!cmd) throw Error('No cmd given for ' + obj)

            if (key.length === 1)
                key = digits.includes(key)
                    ? 'Digit' + key
                    : 'Key' + key.toUpperCase()

            if (modifier === 'None') {
                modifier = ''
            } else if (modifier == undefined) {
                if (['None', '', undefined, null].includes(defaultModifier)) {
                    modifier = ''
                } else {
                    modifier = defaultModifier
                    if (!modifier.endsWith('Key')) {
                        modifier += 'Key'
                    }
                    if (!modifiers.includes(modifier)) {
                        throw Error('Keyboard: ilegal modifier: ' + modifier)
                    }
                }
            }

            keymods[modifier + key] = { modifier, key, cmd }
        })

        console.log('keymods', keymods)
        Object.assign(this, { modifiers, keymods })
    }

    // insure the cmd is executed in this name space:
    handleEvent = ev => this.handleKeyboardEvent(ev)

    /**
     * Start the keyboard running
     */
    start() {
        document.addEventListener('keydown', this.handleEvent)
        return this
    }

    handleKeyboardEvent(event) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
        if (event.isComposing || event.keyCode === 229 || event.repeat) return

        const modifiers = this.modifiers.filter(modifier => event[modifier])
        if (modifiers.length > 1)
            throw Error('multiple modifier keys: ', modifiers)
        const modifier = modifiers.length === 0 ? '' : modifiers[0]

        console.log('e.key, e.code, modifier:', event.key, event.code, modifier)

        const key = modifier + event.code
        const keymod = this.keymods[key]
        // console.log('key, keymod:', key, keymod)

        if (keymod) {
            // console.log(keymod.cmd)
            keymod.cmd()
        }
        // else console.log(event)
    }
    /**
     * Stop the keyboard running
     */
    stop() {
        // Note: multiple calls safe
        document.removeEventListener('keydown', this.handleEvent)
        return this
    }
}

export default Keyboard
