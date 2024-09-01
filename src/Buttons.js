function createButton(div, name, cmd) {
    const button = document.createElement('button')
    button.textContent = name
    button.onclick = cmd

    button.style.backgroundColor = 'skyblue'
    button.style.padding = '10px 14px'
    button.style.fontSize = '18px'
    button.style.border = 'none'
    // button.style.borderRadius = "5px";
    button.style.cursor = 'pointer'
    button.style.margin = '0 5px' // Add margin for spacing between buttons

    div.appendChild(button)
    return button
}

class Buttons {
    constructor(divId, buttonTemplates) {
        const div = document.getElementById(divId)
        this.buttons = {}
        buttonTemplates.forEach(obj => {
            let { name, cmd } = obj
            if (!(cmd && name)) throw Error('No cmd or name given for ' + obj)
            this.buttons[name] = createButton(div, name, cmd)
        })
    }
}

export default Buttons
