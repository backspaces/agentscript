// =================== initialization ===================
// loading links
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'uielements.css'
link.type = 'text/css'
document.head.appendChild(link)

// loading divs.html
await fetch('./divs.html')
    .then(response => response.text())
    .then(html => {
        // Insert after <body> tag starts
        document.body.insertAdjacentHTML('afterbegin', html)
        // console.log('fetch divs.html')
    })

// Initialize the window.ui object if not already defined
window.ui = window.ui || {} // Ensure 'ui' exists
window.ui.json = [] // Initialize the json array

document.getElementById('uiContainer').addEventListener('contextmenu', e => {
    e.preventDefault()
})

// =================== create ui forms for popups ===================

let elementType = ''
let currentDragElement = null
let offsetX = 0
let offsetY = 0

// Show popup modal to create new elements
export function showPopup(type) {
    elementType = type
    const formContainer = document.getElementById('formContainer')
    formContainer.innerHTML = '' // Clear previous form inputs

    let formContent = `
    <label for="name">Name:</label>
    <input type="text" id="elementName" required><br>
    `

    if (type !== 'output') {
        formContent += `
    <label for="command">Command:</label>
    <input type="text" id="elementCommand" required><br>
    `
    }

    // Append specific fields based on the type of element
    let modelTitle = 'Button'
    if (type === 'checkbox') {
        modelTitle = 'Checkbox'
        formContent += `
    <label for="checked">Checked (true/false):</label>
    <input type="checkbox" id="elementChecked"><br>
    `
    } else if (type === 'dropdown') {
        modelTitle = 'Dropdown'
        formContent += `
    <label for="values">Dropdown Options (comma separated):</label>
    <input type="text" id="elementOptions" required><br>
    <label for="selected">Selected Value:</label>
    <input type="text" id="elementSelected" required><br>
    `
    } else if (type === 'range') {
        modelTitle = 'Slider'
        formContent += `
    <label for="min">Min:</label>
    <input type="number" id="elementMin" required><br>
    <label for="max">Max:</label>
    <input type="number" id="elementMax" required><br>
    <label for="step">Step (default 1):</label>
    <input type="number" id="elementStep" value=1 required><br>
    <label for="value">Current Value:</label>
    <input type="number" id="elementValue" required><br>
    `
    } else if (type === 'output') {
        modelTitle = 'Monitor'
        formContent += `
    <label for="monitor">Value/Function to Monitor:</label>
    <input type="text" id="elementMonitor" required><br>
    <label for="fps">Frames per Second (FPS):</label>
    <input type="number" id="elementFps" value="10"><br>
    `
    }

    // console.log('modelTitle', modelTitle)
    document.getElementById('modal-header').innerText = modelTitle

    formContainer.innerHTML = formContent
    document.getElementById('popupModal').style.display = 'flex'
}

// Cancel the popup

export function cancel() {
    document.getElementById('popupModal').style.display = 'none'
}

// =================== create a wrapper for a ui form ===================

function createElementWrapper(element, id) {
    const wrapper = document.createElement('div')
    wrapper.className = 'ui-element'
    wrapper.dataset.id = id // Store the id in the wrapper for reference

    // Set initial pixel-based position for the new element
    const containerRect = document
        .getElementById('uiContainer')
        .getBoundingClientRect()
    wrapper.style.left = containerRect.width / 2 - 50 + 'px' // Centered horizontally
    wrapper.style.top = containerRect.height / 2 - 25 + 'px' // Centered vertically

    wrapper.appendChild(element)

    // Make the element draggable
    wrapper.onmousedown = function (e) {
        // Only start dragging if Ctrl key is held down and it’s a single click
        if (e.ctrlKey && e.detail === 1) {
            dragMouseDown(e)
        }
    }

    // Allow the element to be deleted on double click with shift key down
    wrapper.ondblclick = function (e) {
        if (e.shiftKey) {
            const confirmDelete = confirm('Do you want to delete this control?')
            if (confirmDelete) {
                wrapper.remove() // Remove the element

                // Remove the element from the JSON array using the id
                const elementId = wrapper.dataset.id
                const elementIndex = window.ui.json.findIndex(
                    el => el.id == elementId
                )
                if (elementIndex !== -1) {
                    window.ui.json.splice(elementIndex, 1)
                }
                // Check if any elements are left, and clear the UI if none are
                handleDeletion()
                loadJsonToStorage()
            }
        }
    }

    return wrapper
}
function handleDeletion() {
    if (window.ui.json.length === 0) {
        document.getElementById('uiContainer').innerHTML = '' // Clear the container if empty
    }
}

// =================== create ui form & json from popups ===================

// Submit the form and add the element. called by divs
export function submitForm() {
    const name = document.getElementById('elementName').value
    const id = Date.now() // Generate unique ID for each element
    let command
    if (elementType !== 'output')
        command = document.getElementById('elementCommand').value

    // Calculate center position of the uiContainer
    const uiContainer = document.getElementById('uiContainer')
    const containerRect = uiContainer.getBoundingClientRect()
    const centerX = containerRect.width / 2 - 50 // Adjust based on element width
    const centerY = containerRect.height / 2 - 25 // Adjust based on element height

    // Create a JSON object with initial position at the center of the uiContainer
    let jsonElement = {
        id: id,
        type: elementType,
        name: name,
        command: command,
        position: {
            x: centerX,
            y: centerY,
        },
    }

    // Populate additional properties based on element type
    if (elementType === 'checkbox') {
        jsonElement.checked = document.getElementById('elementChecked').checked
    } else if (elementType === 'dropdown') {
        jsonElement.options = document
            .getElementById('elementOptions')
            .value.split(/,\s*/)
        jsonElement.selected = document.getElementById('elementSelected').value
    } else if (elementType === 'range') {
        jsonElement.min = document.getElementById('elementMin').value
        jsonElement.max = document.getElementById('elementMax').value
        jsonElement.step = document.getElementById('elementStep').value
        jsonElement.value = document.getElementById('elementValue').value
    } else if (elementType === 'output') {
        jsonElement.monitor = document.getElementById('elementMonitor').value
        jsonElement.fps = document.getElementById('elementFps').value || 10
    }

    // Add JSON to the array
    window.ui.json.push(jsonElement)

    // Use the JSON to create the UI element
    createElementFromJSON(jsonElement)

    // Optionally save the updated state
    loadJsonToStorage()

    // Close the modal after adding the element
    document.getElementById('popupModal').style.display = 'none'
}

// =================== json to element ===================
function createElementFromJSON(jsonElement) {
    let elementWrapper

    // Common command execution function
    // function executeCommand(command) {
    //     try {
    //         eval(command)
    //     } catch (error) {
    //         console.error('Command execution failed: ', error)
    //     }
    // }
    // function executeCommand(command, value) {
    //     try {
    //         // Replace any placeholder in the command with the provided value
    //         const finalCommand = command.replace(
    //             /\bvalue\b/g,
    //             JSON.stringify(value)
    //         )
    //         eval(finalCommand)
    //     } catch (error) {
    //         console.error('Command execution failed: ', error)
    //     }
    // }

    // Handle element creation based on type
    if (jsonElement.type === 'button') {
        const button = document.createElement('button')
        button.innerText = jsonElement.name

        button.addEventListener('click', () => eval(jsonElement.command))

        elementWrapper = createElementWrapper(button, jsonElement.id)
    } else if (jsonElement.type === 'checkbox') {
        const checkboxWrapper = document.createElement('div')
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.name = jsonElement.name
        checkbox.checked = jsonElement.checked

        const label = document.createElement('label')
        label.innerText = jsonElement.name
        label.classList.add('checkbox-label')

        // checkbox.addEventListener('change', () => eval(jsonElement.command))
        checkbox.addEventListener('change', function () {
            const value = checkbox.checked
            const checked = checkbox.checked
            eval(jsonElement.command)
        })

        checkboxWrapper.appendChild(checkbox)
        checkboxWrapper.appendChild(label)
        elementWrapper = createElementWrapper(checkboxWrapper, jsonElement.id)
    } else if (jsonElement.type === 'dropdown') {
        const selectWrapper = document.createElement('div')
        selectWrapper.classList.add('dropdown-wrapper')

        const select = document.createElement('select')
        select.name = jsonElement.name
        jsonElement.options.forEach(optionText => {
            const option = document.createElement('option')
            option.value = optionText
            option.text = optionText
            if (option.value === jsonElement.selected) {
                option.selected = true
            }
            select.appendChild(option)
        })

        const label = document.createElement('label')
        label.innerText = jsonElement.name
        selectWrapper.appendChild(label)
        selectWrapper.appendChild(select)

        // select.addEventListener('change', () => eval(jsonElement.command))
        select.addEventListener('change', function () {
            const value = select.value
            eval(jsonElement.command)
        })

        elementWrapper = createElementWrapper(selectWrapper, jsonElement.id)
    } else if (jsonElement.type === 'range') {
        const rangeWrapper = document.createElement('div')
        const range = document.createElement('input')
        range.type = 'range'
        range.name = jsonElement.name
        range.min = jsonElement.min
        range.max = jsonElement.max
        range.step = jsonElement.step
        range.value = jsonElement.value

        const rangeLabel = document.createElement('div')
        rangeLabel.classList.add('range-wrapper')
        const nameLabel = document.createElement('span')
        nameLabel.innerText = jsonElement.name
        const valueLabel = document.createElement('span')
        valueLabel.innerText = range.value

        // range.addEventListener('input', () => eval(jsonElement.command))
        range.addEventListener('input', function () {
            valueLabel.innerText = range.value
            const value = range.value
            eval(jsonElement.command)
        })

        rangeLabel.appendChild(nameLabel)
        rangeLabel.appendChild(valueLabel)
        rangeWrapper.appendChild(rangeLabel)
        rangeWrapper.appendChild(range)
        elementWrapper = createElementWrapper(rangeWrapper, jsonElement.id)
    } else if (jsonElement.type === 'output') {
        const monitorWrapper = document.createElement('div')
        monitorWrapper.classList.add('output-wrapper')

        const label = document.createElement('label')
        label.innerText = jsonElement.name

        const output = document.createElement('output')
        output.name = jsonElement.name

        let previousValue = null

        function checkValue() {
            let currentValue
            try {
                currentValue = eval(jsonElement.monitor)
            } catch (error) {
                console.error('Monitor command execution failed: ', error)
            }

            if (currentValue !== previousValue) {
                output.value = currentValue
                previousValue = currentValue
            }
        }

        setInterval(checkValue, 1000 / jsonElement.fps)

        monitorWrapper.appendChild(label)
        monitorWrapper.appendChild(output)
        elementWrapper = createElementWrapper(monitorWrapper, jsonElement.id)
    }

    // Apply the element's position from JSON
    elementWrapper.style.left = jsonElement.position.x + 'px'
    elementWrapper.style.top = jsonElement.position.y + 'px'

    // Append the recreated element to the UI container
    // document.getElementById('uiContainer').appendChild(elementWrapper)
    document.getElementById('uiContainer').appendChild(elementWrapper)
    // }
}

// =================== ui element utilities ===================

// Make an element draggable when Ctrl is pressed
function dragMouseDown(e) {
    // Only start dragging if Ctrl key is held down
    // if (!e.ctrlKey) return

    e.preventDefault()
    currentDragElement = e.target.closest('.ui-element')

    // Get initial mouse position and element position
    const uiContainerTop = document
        .getElementById('uiContainer')
        .getBoundingClientRect().top
    offsetX = e.clientX - currentDragElement.getBoundingClientRect().left
    offsetY =
        e.clientY -
        currentDragElement.getBoundingClientRect().top +
        uiContainerTop

    console.log('Initial Mouse Position:', e.clientX, e.clientY)
    console.log(
        'Initial Element Position:',
        currentDragElement.style.left,
        currentDragElement.style.top
    )
    console.log('Calculated Offsets:', offsetX, offsetY)

    document.onmousemove = elementDrag
    document.onmouseup = closeDragElement
}

// Drag the element
function elementDrag(e) {
    e.preventDefault()
    const newX = e.clientX - offsetX
    const newY = e.clientY - offsetY

    // Update the UI element's position in the DOM
    currentDragElement.style.left = newX + 'px'
    currentDragElement.style.top = newY + 'px'
}

function closeDragElement() {
    document.onmousemove = null
    document.onmouseup = null

    // Update the associated JSON's position after dragging stops
    const elementId = currentDragElement.dataset.id
    const jsonElement = window.ui.json.find(el => el.id == elementId)

    if (jsonElement) {
        // Get the current position directly (relative to the parent container)
        jsonElement.position.x = parseInt(currentDragElement.style.left, 10)
        jsonElement.position.y = parseInt(currentDragElement.style.top, 10)

        // // Optionally save the updated state to localStorage
        // loadJsonToStorage()
    }
    // Optionally save the updated state to localStorage
    loadJsonToStorage()
}

// Functions to recreate all elements from stored JSON
function loadElementsFromJSON() {
    const uiContainer = document.getElementById('uiContainer')

    // Clear existing elements to avoid duplication
    uiContainer.innerHTML = ''

    // Loop through each element in the window.ui.json array
    window.ui.json.forEach(jsonElement => {
        createElementFromJSON(jsonElement) // Create each element from JSON
    })
}

// =================== localStorage utilities ===================

// let containerDiv = 'uiContainer' // div for dynamically added UI elements
let localStorageName = 'uiState' // localStorage name for caching current elements
export function setStorageName(name) {
    localStorageName = name
}

// move ui.json to localStorage
function loadJsonToStorage() {
    if (!localStorageName) return
    const jsonString = JSON.stringify(window.ui.json) // Convert to string
    localStorage.setItem(localStorageName, jsonString) // Save it to localStorage
}
function loadStorageToJson() {
    if (!localStorageName) return
    const storage = getStorage()
    window.ui.json = JSON.parse(storage) // Convert to json
}

// move localStorage to ui.json and create elements from ui.json
export function createElements() {
    if (!localStorageName) return
    // loadStorageToJson()
    // loadElementsFromJSON()
    const savedState = getStorage()
    if (savedState) {
        window.ui.json = JSON.parse(savedState) // Convert back to array
        loadElementsFromJSON() // Load the elements into the UI
    }
}
export function clearElements() {
    if (!localStorageName) return
    localStorage.removeItem(localStorageName)
    window.ui.json = []
}
export function checkMinElements() {
    if (getStorage()) return
    // clearElements()
    window.ui.json = minJson
    loadJsonToStorage()
    createElements()
}
function getStorage() {
    return localStorage.getItem(localStorageName)
}
const jsonString =
    '[{"command":"ui.anim.start()","id":1728678676436,"name":"start","position":{"x":29,"y":33},"type":"button"},{"command":"ui.anim.stop()","id":1728927362120,"name":"stop","position":{"x":92,"y":34},"type":"button"},{"command":"ui.reset()","id":1728927569824,"name":"reset","position":{"x":59,"y":68},"type":"button"},{"command":"ui.anim.setFps(value)","id":1728682054456,"max":"60","min":"1","name":"fps","position":{"x":165,"y":35},"step":"1","type":"range","value":"30"},{"id":1729270887157,"type":"output","name":"ticks","position":{"x":330,"y":37},"monitor":"ui.model.ticks","fps":"10"}]'
const minJson = JSON.parse(jsonString)

// '[{"command":"ui.anim.start()","id":1728678676436,"name":"start","position":{"x":29,"y":105},"type":"button"},{"command":"ui.anim.stop()","id":1728927362120,"name":"stop","position":{"x":91,"y":104},"type":"button"},{"command":"ui.reset()","id":1728927569824,"name":"reset","position":{"x":60,"y":144},"type":"button"},{"command":"ui.anim.setFps(value)","id":1728682054456,"max":"60","min":"1","name":"fps","position":{"x":165,"y":112},"step":"1","type":"range","value":"30"},{"id":1729269112145,"type":"output","name":"ticks","position":{"x":328,"y":112},"monitor":"ui.model.ticks","fps":"10"}]'
// =================== misc utilities ===================

// let AppName
export function setAppState(
    model,
    view,
    anim,
    storageName = model.constructor.name
) {
    Object.assign(window.ui, { model, view, anim })
    setStorageName(storageName)

    anim.stop() // stop the animation, use uielements to control
    view.draw() // draw once to see the model before running animator

    console.log('localStorageName', localStorageName)
}

// a bit risky: depends on model, view, anim stored in ui by app
function reset() {
    window.ui.model.reset()
    window.ui.view.reset()
    window.ui.anim.reset()
}

Object.assign(window.ui, {
    showPopup,
    submitForm,
    cancel,
    reset,
})
