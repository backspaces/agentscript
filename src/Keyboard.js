class Keyboard {
    /**
     * Creates an instance of Keyboard.
     * The objects in the keyTemplates look like:
     *
     * @constructor
     * @param {Object[]} Commands array of keyboard command objects
     *
     * @example
     * // A command object looks like:
     * {
     *     key: 's',
     *     cmd: () => anim.start(),
     * }
     *
     *
     * @example
     * // The array of keyboard commands looks like:
     *  const keyTemplates = [
     *      { key: 'q', cmd: () => console.log('q') },
     *      { key: '2', cmd: () => console.log('2') },
     *      { key: 'F2', cmd: () => console.log('F2') },
     *      { key: 'ArrowDown', cmd: () => console.log('ArrowDown') },
     *      { key: 'Escape', cmd: () => console.log('Escape') },
     *  ]
     *  const keyboard = new Keyboard(keyTemplates)
     */

    constructor(keyTemplates) {
        this.keyCommands = {}
        keyTemplates.forEach(obj => {
            let { key, cmd } = obj
            if (!cmd) throw Error('No cmd given for ' + obj)
            this.keyCommands[key] = { key, cmd }
        })
        // console.log(this)
    }

    /**
     * Start the keyboard running
     */
    start() {
        document.addEventListener('keydown', this.handleEvent)
        return this
    }

    /**
     * Stop the keyboard running
     */
    stop() {
        // Note: multiple calls safe
        document.removeEventListener('keydown', this.handleEvent)
        return this
    }

    // insure the cmd is executed in this name space:
    handleEvent = ev => this.handleKeyboardEvent(ev)

    handleKeyboardEvent(event) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
        if (event.isComposing || event.keyCode === 229 || event.repeat) {
            console.log('skipping..', event)
            return
        }

        // const modifiers = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']

        const key = this.keyCommands[event.key]
        if (key) {
            console.log('key:', key.key, 'cmd:', key.cmd)
            key.cmd()
        } else {
            if (event.key.length === 1) {
                console.log('you typed key:', event.key + '; key event:', event)
            }
        }
    }
}

export default Keyboard
