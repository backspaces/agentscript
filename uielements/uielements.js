import * as util from 'https://code.agentscript.org/src/utils.js'

// =================== initialization ===================
// loading links
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'uielements.css'
link.type = 'text/css'
document.head.appendChild(link)

await fetch('./divs.html')
    .then(response => response.text())
    .then(html => {
        // Insert the HTML content for the menu into the DOM
        document.body.insertAdjacentHTML('afterbegin', html)
        console.log('divs.html loaded and parsed')
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
let selectedWrapper
let editingElementId = null
let selectedElementId
let offsetX = 0
let offsetY = 0

// Show popup modal to create new elements, called from divs.html
export function showPopup(type, jsonData = null) {
    elementType = type
    const formContainer = document.getElementById('formContainer')
    formContainer.innerHTML = '' // Clear previous form inputs

    // Set default modelTitle and add type-specific fields
    let modelTitle = 'Button'
    let formContent = `
    <label for="name">Name:</label>
    <input type="text" id="elementName" value="${
        jsonData ? jsonData.name : ''
    }" required><br>
    `

    // Include the command field for all types except 'output'
    if (type !== 'output') {
        formContent += `
    <label for="command">Command:</label>
    <input type="text" id="elementCommand" value="${
        jsonData ? jsonData.command : ''
    }" required><br>
    `
    }

    // Append specific fields based on the type of element
    if (type === 'checkbox') {
        modelTitle = 'Checkbox'
        formContent += `
    <label for="checked">Checked:</label>
    <input type="checkbox" id="elementChecked" ${
        jsonData && jsonData.checked ? 'checked' : ''
    }><br>
    `
    } else if (type === 'dropdown') {
        modelTitle = 'Dropdown'
        formContent += `
    <label for="values">Dropdown Options (comma separated):</label>
    <input type="text" id="elementOptions" value="${
        jsonData ? jsonData.options.join(', ') : ''
    }" required><br>
    <label for="selected">Selected Value:</label>
    <input type="text" id="elementSelected" value="${
        jsonData ? jsonData.selected : ''
    }" required><br>
    `
    } else if (type === 'range') {
        modelTitle = 'Slider'
        formContent += `
    <label for="min">Min:</label>
    <input type="number" id="elementMin" value="${
        jsonData ? jsonData.min : ''
    }" required><br>
    <label for="max">Max:</label>
    <input type="number" id="elementMax" value="${
        jsonData ? jsonData.max : ''
    }" required><br>
    <label for="step">Step:</label>
    <input type="number" id="elementStep" value="${
        jsonData ? jsonData.step : 1
    }" required><br>
    <label for="value">Current Value:</label>
    <input type="number" id="elementValue" value="${
        jsonData ? jsonData.value : ''
    }" required><br>
    `
    } else if (type === 'output') {
        modelTitle = 'Monitor'
        formContent += `
    <label for="monitor">Value/Function to Monitor:</label>
    <input type="text" id="elementMonitor" value="${
        jsonData ? jsonData.monitor : ''
    }" required><br>
    <label for="fps">Frames per Second (FPS):</label>
    <input type="number" id="elementFps" value="${
        jsonData ? jsonData.fps : 10
    }"><br>
    `
    }

    // Set form header based on whether we're adding or editing
    document.getElementById('modal-header').innerText = jsonData
        ? `Edit ${modelTitle}`
        : `Add ${modelTitle}`

    // Set the button label in the modal footer
    document.querySelector('.modal-footer button:last-child').innerText =
        jsonData ? 'Edit Element' : 'Add Element'

    formContainer.innerHTML = formContent
    document.getElementById('popupModal').style.display = 'flex'

    // Track if editing an existing element
    editingElementId = jsonData ? jsonData.id : null
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

    // Set initial position for the new element
    const containerRect = document
        .getElementById('uiContainer')
        .getBoundingClientRect()
    wrapper.style.left = containerRect.width / 2 - 50 + 'px'
    wrapper.style.top = containerRect.height / 2 - 25 + 'px'
    wrapper.appendChild(element)

    // Handle dragging with Ctrl + mousedown
    wrapper.onmousedown = function (e) {
        if (e.ctrlKey) {
            dragMouseDown(e)
        } else if (e.shiftKey) {
            // Prevent default behavior and show popup menu
            e.preventDefault()
            showPopupMenu(e, wrapper)
        }
    }

    return wrapper
}

// Menu option handlers (global scope)
document.getElementById('deleteOption').onclick = function (e) {
    e.stopPropagation() // Prevent bubbling to document handler
    console.log('Delete option clicked')
    const confirmDelete = confirm('Do you want to delete this control?')
    if (confirmDelete) {
        // const wrapper = window.selectedWrapper
        const wrapper = selectedWrapper
        wrapper.remove() // Remove the element from the dom

        // Remove the element from the JSON array using the id
        // const elementId = window.selectedElementId
        const elementId = selectedElementId
        // to let id & elementId be string or number, use !=
        window.ui.json = window.ui.json.filter(el => el.id != elementId)

        jsonToStorage() // Save the updated state
    }
    closePopupMenu() // Hide the popup menu
}

document.getElementById('cancelOption').onclick = function (e) {
    e.stopPropagation() // Prevent bubbling to document handler
    console.log('Cancel option clicked')
    closePopupMenu() // Just hide the popup menu
}

document.getElementById('editOption').onclick = function (e) {
    e.stopImmediatePropagation()
    console.log('Edit option clicked')

    const elementId = selectedElementId
    const jsonElement = window.ui.json?.find(el => el.id == elementId)

    if (jsonElement) {
        // Use showPopup for editing, passing in jsonElement for pre-filled values
        showPopup(jsonElement.type, jsonElement)
    }
    closePopupMenu() // Close the popup menu
}

// Function to show the popup menu and start listening for outside clicks
function showPopupMenu(e, wrapper) {
    const popupMenu = document.getElementById('popupMenu')
    popupMenu.style.display = 'block'
    popupMenu.style.left = `${e.pageX}px`
    popupMenu.style.top = `${e.pageY}px`

    // window.selectedElementId = wrapper.dataset.id
    // window.selectedWrapper = wrapper
    selectedElementId = wrapper.dataset.id
    selectedWrapper = wrapper

    // Start listening for clicks outside of the menu when it is shown
    document.addEventListener('mousedown', handleOutsideClick)

    // Prevent further propagation
    e.stopPropagation()
}

// Function to handle clicks outside the popup menu
function handleOutsideClick(e) {
    const popupMenu = document.getElementById('popupMenu')

    // If the click is outside the menu, close it
    if (!popupMenu.contains(e.target)) {
        console.log('Clicked outside, closing menu')
        closePopupMenu()
    }
}

// Function to close the popup menu and stop listening for outside clicks
function closePopupMenu() {
    const popupMenu = document.getElementById('popupMenu')
    popupMenu.style.display = 'none'

    // Stop listening for clicks outside the menu
    document.removeEventListener('mousedown', handleOutsideClick)
}

// =================== create ui form & json from popups ===================

// Submit the form and add the element. called from divs
export function submitForm() {
    const name = document.getElementById('elementName').value
    const command =
        elementType !== 'output'
            ? document.getElementById('elementCommand').value
            : null
    const id = editingElementId || Date.now() // Use existing ID if editing, otherwise create new

    // Find or initialize JSON element
    let jsonElement = window.ui.json.find(el => el.id === id) // == not needed here

    if (jsonElement) {
        // Update existing JSON data
        jsonElement.name = name
        jsonElement.command = command
    } else {
        // Calculate center position of the uiContainer for a new element
        const uiContainer = document.getElementById('uiContainer')
        const containerRect = uiContainer.getBoundingClientRect()
        const centerX = containerRect.width / 2 - 50 // Adjust for element width
        const centerY = containerRect.height / 2 - 25 // Adjust for element height

        // Create a new JSON object with initial position at the center
        jsonElement = {
            id: id,
            type: elementType,
            name: name,
            command: command,
            position: {
                x: centerX,
                y: centerY,
            },
        }
        window.ui.json.push(jsonElement) // Add to JSON array
    }

    // Populate specific fields based on the element type
    if (elementType === 'checkbox') {
        jsonElement.checked =
            document.getElementById('elementChecked')?.checked || false
    } else if (elementType === 'dropdown') {
        jsonElement.options =
            document.getElementById('elementOptions')?.value.split(/,\s*/) || []
        jsonElement.selected =
            document.getElementById('elementSelected')?.value || ''
    } else if (elementType === 'range') {
        jsonElement.min = document.getElementById('elementMin')?.value || 0
        jsonElement.max = document.getElementById('elementMax')?.value || 100
        jsonElement.step = document.getElementById('elementStep')?.value || 1
        jsonElement.value = document.getElementById('elementValue')?.value || 50
    } else if (elementType === 'output') {
        jsonElement.monitor =
            document.getElementById('elementMonitor')?.value || ''
        jsonElement.fps = document.getElementById('elementFps')?.value || 10
    }

    // Remove and re-create the element in the UI with updated data if editing
    if (editingElementId) {
        const existingWrapper = document.querySelector(`[data-id="${id}"]`)
        if (existingWrapper) {
            existingWrapper.remove() // Remove the old element from the UI
        }
    }
    createElementFromJSON(jsonElement)

    // Save changes to local storage
    jsonToStorage()

    // Close popup and reset editing state
    document.getElementById('popupModal').style.display = 'none'
    editingElementId = null
}

// =================== json to html element ===================
function createElementFromJSON(jsonElement) {
    let elementWrapper

    // Handle element creation based on type
    if (jsonElement.type === 'button') {
        const button = document.createElement('button')
        button.innerText = jsonElement.name

        // button.addEventListener('click', () => eval(jsonElement.command))
        button.addEventListener('click', function () {
            try {
                // values available within the command
                const { model, view, anim, reset, util } = ui
                eval(jsonElement.command)
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
        })

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

        checkbox.addEventListener('change', function () {
            try {
                // values available within the command
                const { model, view, anim, reset, util } = ui
                const value = checkbox
                const checked = checkbox.checked
                eval(jsonElement.command)
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
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

        select.addEventListener('change', function () {
            try {
                // values available within the command
                const { model, view, anim, reset, util } = ui
                const value = select.value
                eval(jsonElement.command)
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
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

        range.addEventListener('input', function () {
            valueLabel.innerText = range.value
            try {
                // values available within the command
                const { model, view, anim, reset, util } = ui
                const value = range.value
                eval(jsonElement.command)
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
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
                const { model, view, anim, reset, util } = ui
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
    document.getElementById('uiContainer').appendChild(elementWrapper)
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
    // to let id & elementId be string or number, use ==
    const jsonElement = window.ui.json.find(el => el.id == elementId)

    if (jsonElement) {
        // Get the current position directly (relative to the parent container)
        jsonElement.position.x = parseInt(currentDragElement.style.left, 10)
        jsonElement.position.y = parseInt(currentDragElement.style.top, 10)
    }
    // save the updated state to localStorage
    jsonToStorage()
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

const minJsonString =
    '[{"command":"ui.anim.start()","id":1728678676436,"name":"start","position":{"x":29,"y":33},"type":"button"},{"command":"ui.anim.stop()","id":1728927362120,"name":"stop","position":{"x":92,"y":34},"type":"button"},{"command":"ui.reset()","id":1728927569824,"name":"reset","position":{"x":59,"y":68},"type":"button"},{"command":"ui.anim.setFps(value)","id":1728682054456,"max":"60","min":"0","name":"fps","position":{"x":165,"y":35},"step":"1","type":"range","value":"30"},{"id":1729270887157,"type":"output","name":"ticks","position":{"x":330,"y":37},"monitor":"ui.model.ticks","fps":"10"}]'
const minJson = JSON.parse(minJsonString)

function jsonToStorage() {
    const jsonString = JSON.stringify(window.ui.json) // Convert to string
    localStorage.setItem(localStorageName, jsonString) // Save it to localStorage
}

// =================== functions called by users html file ===================

let localStorageName
export function setAppState(
    model,
    view,
    anim,
    storageName = model.constructor.name
) {
    Object.assign(window.ui, { model, view, anim })
    localStorageName = storageName

    anim.stop() // stop the animation, use uielements to control
    view.draw() // draw once to see the model before running animator

    console.log('localStorageName', localStorageName)
}

// was loadUIState, now includes minJson for new html file
export function createElements(useMinElements = true) {
    const savedState = localStorage.getItem(localStorageName)
    if (savedState) {
        window.ui.json = JSON.parse(savedState) // Convert back to array
    } else if (useMinElements) {
        window.ui.json = minJson
    } else {
        return
    }
    loadElementsFromJSON()
}

// a bit risky: depends on model, view, anim stored in ui by app
function reset() {
    window.ui.model.reset()
    // window.ui.view.reset()
    window.ui.anim.reset()
    window.ui.view.draw()
}

function setJson(json) {
    window.ui.json = json
    jsonToStorage()
    loadElementsFromJSON()
}

Object.assign(window.ui, {
    // used in divs.html
    showPopup,
    submitForm,
    cancel,
    // used by commands
    reset,
    util,
    // used in devtools
    setJson,
})
