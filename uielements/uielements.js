import * as util from '../src/utils.js'
import Plot from '../src/Plot.js'

const params = {}
params.json = []

document.getElementById('uiContainer').addEventListener('contextmenu', e => {
    e.preventDefault()
})

// =================== create ui forms for popups ===================

let elementType = '' // Holds the type of element being added or edited (e.g., 'button', 'checkbox').
let currentDragElement = null // Tracks the element currently being dragged for smooth dragging.
let selectedWrapper // Reference to the wrapper element of the selected element in the UI.
let editingElementId = null // Holds the ID of the element currently being edited, if any.
let selectedElementId // Stores the ID of the element selected in the popup menu for actions like edit or delete.
let offsetX = 0 // Used to manage x-offset during dragging to align the element to cursor position.
let offsetY = 0 // Used to manage y-offset during dragging to align the element to cursor position.

// Show popup modal to create new elements, called from divs.html
export function showPopup(type, jsonData = null) {
    elementType = type
    const formContainer = document.getElementById('formContainer')
    formContainer.innerHTML = '' // Clear previous form inputs

    let modelTitle = 'Element'
    if (type === 'button') modelTitle = 'Button'
    else if (type === 'checkbox') modelTitle = 'Checkbox'
    else if (type === 'dropdown') modelTitle = 'Dropdown'
    else if (type === 'range') modelTitle = 'Slider'
    else if (type === 'output') modelTitle = 'Monitor'
    else if (type === 'plot') modelTitle = 'Plot'

    let formContent = `
    <label for="name">Name:</label>
    <input type="text" id="elementName" value="${
        jsonData ? jsonData.name : ''
    }" required><br>
    `

    if (type !== 'output' && type !== 'plot') {
        formContent += `
    <label for="command">Command:</label>
    <input type="text" id="elementCommand" value="${
        jsonData ? jsonData.command : ''
    }" required><br>
    `
    }
    if (type === 'checkbox') {
        formContent += `
    <label for="elementChecked">Checked:</label>
    <input type="checkbox" id="elementChecked" ${
        jsonData && jsonData.checked ? 'checked' : ''
    }><br>
    `
    } else if (type === 'dropdown') {
        formContent += `
    <label for="values">Dropdown Options (comma separated):</label>
    <input type="text" id="elementOptions" value="${
        jsonData && jsonData.options ? jsonData.options.join(', ') : ''
    }" required><br>
    <label for="selected">Selected Value:</label>
    <input type="text" id="elementSelected" value="${
        jsonData ? jsonData.selected : ''
    }" required><br>
    `
    } else if (type === 'range') {
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
    } else if (type === 'plot') {
        formContent += `
    <label for="width">Width:</label>
    <input type="number" id="plotWidth" value="${
        jsonData ? jsonData.width : 450
    }" required><br>
    <label for="height">Height:</label>
    <input type="number" id="plotHeight" value="${
        jsonData ? jsonData.height : 150
    }" required><br>
    <label for="pens">Pens (comma separated):</label>
    <input type="text" id="plotPens" value="${
        jsonData && jsonData.pens ? jsonData.pens.join(', ') : ''
    }" required><br>
    <label for="fps">Frames per Second (FPS):</label>
    <input type="number" id="plotFps" value="${
        jsonData ? jsonData.fps : 60
    }" required><br>
    `
    }

    document.getElementById('modal-header').innerText = jsonData
        ? `Edit ${modelTitle}`
        : `Add ${modelTitle}`
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

// Function to show the popup menu and start listening for outside clicks
function showPopupMenu(e, wrapper) {
    if (isStaticMode) return // Disable menu in static mode

    const popupMenu = document.getElementById('popupMenu')
    popupMenu.style.display = 'block'
    popupMenu.style.left = `${e.pageX}px`
    popupMenu.style.top = `${e.pageY}px`

    // Set global references
    selectedWrapper = wrapper
    selectedElementId = wrapper.dataset.id

    // Attach dynamic listeners for menu options
    document.getElementById('deleteOption').onclick = function (e) {
        e.stopPropagation()
        console.log('Delete option clicked')
        const confirmDelete = confirm('Do you want to delete this element?')
        if (confirmDelete) {
            selectedWrapper.remove()
            params.json = params.json.filter(el => el.id != selectedElementId)
            jsonToStorage()
            console.log('Element deleted successfully:', selectedElementId)
        }
        closePopupMenu()
    }

    document.getElementById('editOption').onclick = function (e) {
        e.stopPropagation()
        console.log('Edit option clicked')
        const jsonElement = params.json.find(el => el.id == selectedElementId)
        if (jsonElement) {
            showPopup(jsonElement.type, jsonElement)
        }
        closePopupMenu()
    }

    document.getElementById('cancelOption').onclick = function (e) {
        e.stopPropagation()
        console.log('Cancel option clicked')
        closePopupMenu()
    }
}

// Function to close the popup menu and stop listening for outside clicks
function closePopupMenu() {
    const popupMenu = document.getElementById('popupMenu')
    popupMenu.style.display = 'none'
    selectedWrapper = null
    selectedElementId = null
}

// =================== create ui form & json from popups ===================

// Submit the form and add the element. called from divs
export function submitForm() {
    const name = document.getElementById('elementName').value
    const command =
        elementType !== 'output' && elementType !== 'plot'
            ? document.getElementById('elementCommand').value
            : null
    const id = editingElementId || Date.now() // Use existing ID if editing, otherwise create new

    // Find or initialize JSON element
    let jsonElement = params.json.find(el => el.id === id) // == not needed here

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
        params.json.push(jsonElement) // Add to JSON array
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
    } else if (elementType === 'plot') {
        jsonElement.width = document.getElementById('plotWidth').value
        jsonElement.height = document.getElementById('plotHeight').value

        const pensInput = document.getElementById('plotPens').value.trim()
        jsonElement.pens = pensInput ? pensInput.split(/,\s*/) : [] // Default to an empty array

        jsonElement.fps = document.getElementById('plotFps').value || 60
    }

    // Remove and re-create the element in the UI with updated data if editing
    if (editingElementId) {
        const existingWrapper = document.querySelector(`[data-id="${id}"]`)
        if (existingWrapper) {
            existingWrapper.remove() // Remove the old element from the UI
        }
    }
    createElementFromJSON(jsonElement)

    // Save changes to storage
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

        button.addEventListener('click', function () {
            try {
                const { model, view, anim, reset, downloadJson } = params
                eval(jsonElement.command)
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
        })

        elementWrapper = createElementWrapper(button, jsonElement.id)
    } else if (jsonElement.type === 'checkbox') {
        const checkboxWrapper = document.createElement('div')

        // Create a label that wraps both the checkbox and label text
        const checkboxLabel = document.createElement('label')
        checkboxLabel.classList.add('checkbox-label')

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.id = jsonElement.id // Set unique ID for the checkbox
        checkbox.checked = jsonElement.checked

        // Set label text and make it clickable by wrapping both elements
        checkboxLabel.innerText = jsonElement.name
        checkboxLabel.prepend(checkbox) // Place checkbox before text in the label

        checkbox.addEventListener('change', function () {
            try {
                const { model, view, anim, reset, downloadJson } = params
                const value = checkbox
                const checked = checkbox.checked
                eval(jsonElement.command)
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
        })

        checkboxWrapper.appendChild(checkboxLabel)
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
                const { model, view, anim, reset, downloadJson } = params
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
                const { model, view, anim, reset, downloadJson } = params
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
                const { model, view, anim, reset, downloadJson } = params
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
    } else if (jsonElement.type === 'plot') {
        // Create a container for the plot
        const plotDiv = document.createElement('div')
        plotDiv.id = `plot-${jsonElement.id}`
        plotDiv.classList.add('plot-container')
        plotDiv.style.width = `${jsonElement.width}px`
        plotDiv.style.height = `${jsonElement.height}px`

        // Initialize the plot using Plot.js
        const plot = new Plot(plotDiv, jsonElement.pens, {
            title: jsonElement.name,
            width: Number(jsonElement.width),
            height: Number(jsonElement.height),
            // legend: { show: true },
        })

        plot.updatePlotFromModel(params.model)

        // Start monitoring the plot
        plot.monitorModel(params.model, jsonElement.fps)

        params.plot = plot

        // Wrap the plotDiv in a draggable wrapper
        elementWrapper = createElementWrapper(plotDiv, jsonElement.id)

        setTimeout(() => {
            // Find the .uplot container
            const uplotElement = plotDiv.querySelector('.uplot')
            // Set wrapper height to uplot height
            if (uplotElement) {
                elementWrapper.style.height = `${uplotElement.clientHeight}px`
            }
        }, 50) // wait 50ms
    }

    // Ensure elementWrapper is created before applying position
    if (elementWrapper) {
        elementWrapper.style.left = jsonElement.position.x + 'px'
        elementWrapper.style.top = jsonElement.position.y + 'px'

        if (isStaticMode) {
            elementWrapper.onmousedown = null // Disable dragging
            elementWrapper.oncontextmenu = e => e.preventDefault() // Disable right-click menu
            // elementWrapper.classList.add('static-element') // Optional: add styling for static mode
        }

        document.getElementById('uiContainer').appendChild(elementWrapper)
    }
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
    const jsonElement = params.json.find(el => el.id == elementId)

    if (jsonElement) {
        // Get the current position directly (relative to the parent container)
        jsonElement.position.x = parseInt(currentDragElement.style.left, 10)
        jsonElement.position.y = parseInt(currentDragElement.style.top, 10)
    }
    // save the updated state to storage
    jsonToStorage()
}

// Functions to recreate all elements from stored JSON
function loadElementsFromJSON() {
    const uiContainer = document.getElementById('uiContainer')

    // Clear existing elements to avoid duplication
    uiContainer.innerHTML = ''

    // Loop through each element in the params.json array
    params.json.forEach(jsonElement => {
        createElementFromJSON(jsonElement) // Create each element from JSON
    })
}

// =================== storage utilities ===================

let minJsonString = `[{"id":1729270887157,"type":"output","name":"ticks","position":{"x":342,"y":21},"monitor":"model.ticks","fps":"10","command":null},{"id":1729463191305,"type":"range","name":"patchesSize","command":"view.setValue('patchesSize', value)","position":{"x":172,"y":21},"min":"1","max":"20","step":"1","value":"12"},{"id":1730141024864,"type":"checkbox","name":"Run","command":"checked ? anim.start() : anim.stop()","position":{"x":20,"y":21},"checked":false},{"id":1733442807622,"type":"dropdown","name":"fps","command":"anim.setFps(value)","position":{"x":100,"y":21},"options":["2","5","10","20","30","60"],"selected":"30"},{"id":1729535684833,"type":"button","name":"Save","command":"downloadJson()","position":{"x":405,"y":21}}]`
const minJson = JSON.parse(minJsonString)

const persistentStorage = {
    // autoDownload: false,
    // userName: null,
    modelName: null,
    elementsName: null,
    get: function () {
        // const jsonString = localStorage.getItem(this.userName + this.modelName)
        const jsonString = localStorage.getItem(this.modelName)
        return JSON.parse(jsonString)
    },
    put: function (json) {
        const jsonString = JSON.stringify(json)
        // localStorage.setItem(this.userName + this.modelName, jsonString)
        localStorage.setItem(this.modelName, jsonString)
        // if (this.autoDownload) downloadJson()
    },
}

function jsonToStorage() {
    const json = params.json
    persistentStorage.put(json)
    console.log('json: ', json)
}

// export function autoDownload(bool) {
//     persistentStorage.autoDownload = bool
// }

export function setAppState(model, view, anim) {
    const modelName = model.constructor.name
    const elementsName =
        modelName.replace('Model', '').toLowerCase() + 'Elements.js'

    Object.assign(params, { model, view, anim })
    // Object.assign(persistentStorage, { userName, modelName, elementsName })
    Object.assign(persistentStorage, { modelName, elementsName })

    anim.stop() // stop the animation, use uielements to control
    view.draw() // draw once to see the model before running animator

    console.log('persistentStorage:', persistentStorage)

    util.toWindow({ model, view, anim })
}

let initialJson, isStaticMode
// Three modes: new editable, static file, editable file. Any need for new static?
export function createElements(json = null, isEditable = json == null) {
    isStaticMode = !isEditable
    if (isEditable) {
        // Show control panel
        document.getElementById('controlPanel').style.display = 'block'
    }

    params.json = json == null ? minJson : json
    initialJson = json == null ? '[]' : JSON.stringify(params.json)

    console.log('hasUnsavedChanges:', hasUnsavedChanges())
    // if (json == null) downloadJson() // need user geesture
    if (json == null && isEditable) {
        alert('You can use "Save" at any time to download your new Elements.')
    }

    jsonToStorage()
    loadElementsFromJSON()
}
function hasUnsavedChanges() {
    return initialJson !== JSON.stringify(params.json)
}

window.addEventListener('beforeunload', event => {
    console.log('hasUnsavedChanges', hasUnsavedChanges())

    if (hasUnsavedChanges()) {
        event.preventDefault()
        event.returnValue = '' // Triggers the browser warning

        // Show manual save option (but async saving is blocked here)
        // setTimeout(() => {
        //     alert(
        //         "You have unsaved changes. Click 'Save Now' before reloading."
        //     )
        // }, 10)
    }
})

async function downloadJson() {
    if (isStaticMode) {
        console.warn('Download disabled in static mode.')
        return
    }

    const elementsName = persistentStorage.elementsName
    // Convert JSON to an ES module format
    const jsonModuleContent = `export default ${JSON.stringify(
        params.json,
        null,
        4
    )}`
    console.log(elementsName, jsonModuleContent)

    try {
        // Open the file picker
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: elementsName,
            types: [
                {
                    description: 'JavaScript Module',
                    accept: { 'application/javascript': ['.js'] },
                },
            ],
        })

        // Write the file
        const writable = await fileHandle.createWritable()
        await writable.write(jsonModuleContent)
        await writable.close()

        console.log(`File saved: ${fileHandle.name}`)
        initialJson = JSON.stringify(params.json)
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('User canceled the file save dialog.')
        } else {
            console.error('File save failed:', error)
            console.log('Trying Download/ folder')
            util.downloadJsonModule(params.json, elementsName)
            initialJson = JSON.stringify(params.json)
        }
    }
}

// =================== functions called by users commands ===================

function reset() {
    params.anim.restart(params.model, params.view, params.plot)
}

window.ui = {
    showPopup,
    submitForm,
    cancel,
}
Object.assign(params, {
    // already has: model view anim
    reset,
    downloadJson,
})

console.log('params', params)
console.log('window.ui', window.ui)
