// Initialize the ui object if not already defined
window.ui = window.ui || {} // Ensure 'ui' exists
window.ui.json = [] // Initialize the json array

document.getElementById('uiContainer').addEventListener('contextmenu', e => {
    e.preventDefault()
})

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
    <label for="step">Step:</label>
    <input type="number" id="elementStep" required><br>
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
                saveUIState()
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

// Submit the form and add the element
export function submitForm() {
    const name = document.getElementById('elementName').value
    const uiContainer = document.getElementById('uiContainer')
    const id = Date.now() // Generate unique ID for each element
    let command
    if (elementType !== 'output')
        command = document.getElementById('elementCommand').value

    let elementWrapper
    let jsonElement = {
        id: id, // Store the unique id
        type: elementType,
        name: name,
        command: command,
        position: {
            x: 0, // These will be updated when the element is positioned
            y: 0,
        },
    }

    // Logic to handle each element type
    if (elementType === 'button') {
        const button = document.createElement('button')
        button.innerText = name

        button.addEventListener('click', function () {
            try {
                eval(command) // Execute command on button click
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
        })

        elementWrapper = createElementWrapper(button, id)
    } else if (elementType === 'checkbox') {
        const checkboxWrapper = document.createElement('div')
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.name = name
        checkbox.checked = document.getElementById('elementChecked').checked

        const label = document.createElement('label')
        label.innerText = name
        label.classList.add('checkbox-label')

        checkbox.addEventListener('change', function () {
            try {
                // const value = checkbox.checked
                eval(command) // Execute command on checkbox change
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
        })

        checkboxWrapper.appendChild(checkbox)
        checkboxWrapper.appendChild(label)
        elementWrapper = createElementWrapper(checkboxWrapper, id)

        jsonElement.checked = checkbox.checked
    } else if (elementType === 'dropdown') {
        const selectWrapper = document.createElement('div')
        selectWrapper.classList.add('dropdown-wrapper')

        const select = document.createElement('select')
        select.name = name
        const options = document
            .getElementById('elementOptions')
            .value.split(/,\s*/)
        const selectedValue = document.getElementById('elementSelected').value
        options.forEach(optionText => {
            const option = document.createElement('option')
            option.value = optionText.trim()
            option.text = optionText.trim()
            if (option.value === selectedValue) {
                option.selected = true
            }
            select.appendChild(option)
        })

        const label = document.createElement('label')
        label.innerText = name
        selectWrapper.appendChild(label)
        selectWrapper.appendChild(select)

        select.addEventListener('change', function () {
            try {
                // const value = select.value
                eval(command) // Execute command on dropdown change
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
        })

        elementWrapper = createElementWrapper(selectWrapper, id)

        jsonElement.options = options
        jsonElement.selected = selectedValue
    } else if (elementType === 'range') {
        const rangeWrapper = document.createElement('div')
        const range = document.createElement('input')
        range.type = 'range'
        range.name = name
        range.min = document.getElementById('elementMin').value
        range.max = document.getElementById('elementMax').value
        range.step = document.getElementById('elementStep').value
        range.value = document.getElementById('elementValue').value

        const rangeLabel = document.createElement('div')
        rangeLabel.classList.add('range-wrapper')
        const nameLabel = document.createElement('span')
        nameLabel.innerText = name
        const valueLabel = document.createElement('span')
        valueLabel.innerText = range.value

        range.addEventListener('input', function () {
            valueLabel.innerText = range.value
            try {
                eval(command) // Execute command on range input
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
        })

        rangeLabel.appendChild(nameLabel)
        rangeLabel.appendChild(valueLabel)
        rangeWrapper.appendChild(rangeLabel)
        rangeWrapper.appendChild(range)
        elementWrapper = createElementWrapper(rangeWrapper, id)

        jsonElement.min = range.min
        jsonElement.max = range.max
        jsonElement.step = range.step
        jsonElement.value = range.value
    } else if (elementType === 'output') {
        const monitorWrapper = document.createElement('div')
        monitorWrapper.classList.add('output-wrapper')

        const label = document.createElement('label')
        label.innerText = name

        const output = document.createElement('output')
        output.name = name

        const monitoredValue = document.getElementById('elementMonitor').value
        const fps = document.getElementById('elementFps').value || 10
        let previousValue = null

        function checkValue() {
            let currentValue
            try {
                currentValue = eval(monitoredValue) // Execute the command to fetch monitored value
            } catch (error) {
                console.error('Monitor command execution failed: ', error)
            }

            if (currentValue !== previousValue) {
                output.value = currentValue
                previousValue = currentValue
            }
        }

        setInterval(checkValue, 1000 / fps)

        monitorWrapper.appendChild(label)
        monitorWrapper.appendChild(output)
        elementWrapper = createElementWrapper(monitorWrapper, id)

        jsonElement.monitor = monitoredValue
        jsonElement.fps = fps
    }

    // Append the new element to the container
    uiContainer.appendChild(elementWrapper)

    // Get element's final position for JSON storage
    const rect = elementWrapper.getBoundingClientRect()
    jsonElement.position.x = rect.left
    jsonElement.position.y = rect.top

    // Store the element in the JSON array
    window.ui.json.push(jsonElement)

    saveUIState()

    // Close the modal after adding the element
    document.getElementById('popupModal').style.display = 'none'
}

function createElementFromJSON(jsonElement) {
    let elementWrapper

    // Logic to handle each element type from JSON
    if (jsonElement.type === 'button') {
        const button = document.createElement('button')
        button.innerText = jsonElement.name

        button.addEventListener('click', function () {
            try {
                eval(jsonElement.command) // Execute command on button click
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
                eval(jsonElement.command) // Execute command on checkbox change
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
                eval(jsonElement.command) // Execute command on dropdown change
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
                eval(jsonElement.command) // Execute command on range input
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
                currentValue = eval(jsonElement.monitor) // Execute the command to fetch monitored value
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

    // Set the element's position from JSON
    // elementWrapper.style.left = jsonElement.position.x + 'px'
    // elementWrapper.style.top = jsonElement.position.y + 'px'
    elementWrapper.style.left = jsonElement.position.x + 'px'
    elementWrapper.style.top = jsonElement.position.y + 'px'

    // Append the recreated element to the UI container
    document.getElementById('uiContainer').appendChild(elementWrapper)
}

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
        // saveUIState()
    }
    // Optionally save the updated state to localStorage
    saveUIState()
}

// Function to recreate all elements from stored JSON
// export function loadElementsFromJSON() {
//     window.ui.json.forEach(jsonElement => {
//         createElementFromJSON(jsonElement)
//     })
// }
export function loadElementsFromJSON() {
    const uiContainer = document.getElementById('uiContainer')

    // Clear existing elements to avoid duplication
    uiContainer.innerHTML = ''

    // Loop through each element in the ui.json array
    window.ui.json.forEach(jsonElement => {
        createElementFromJSON(jsonElement) // Create each element from JSON
    })
}

function saveUIState() {
    console.log('saveUIState: json', window.ui.json)

    const jsonString = JSON.stringify(window.ui.json) // Convert to string
    localStorage.setItem('uiState', jsonString) // Save it to localStorage

    console.log('saveUIState: string to json', JSON.parse(jsonString))
}
export function loadUIState() {
    const savedState = localStorage.getItem('uiState')
    if (savedState) {
        window.ui.json = JSON.parse(savedState) // Convert back to array
        loadElementsFromJSON() // Load the elements into the UI
    }
}

// loadUIState()

Object.assign(window.ui, {
    showPopup,
    submitForm,
    cancel,
    loadUIState,
    loadElementsFromJSON,
})
