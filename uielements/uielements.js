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

// Submit the form and add the element
export function submitForm() {
    const name = document.getElementById('elementName').value
    const command = document.getElementById('elementCommand').value
    const uiContainer = document.getElementById('uiContainer')

    function createElementWrapper(element) {
        const wrapper = document.createElement('div')
        wrapper.className = 'ui-element'

        // Set initial pixel-based position for the new element
        const containerRect = uiContainer.getBoundingClientRect()
        wrapper.style.left = containerRect.width / 2 - 50 + 'px' // Centered horizontally
        wrapper.style.top = containerRect.height / 2 - 25 + 'px' // Centered vertically

        wrapper.appendChild(element)

        // Make the element draggable
        wrapper.onmousedown = dragMouseDown

        // Add double-click functionality to delete the element
        wrapper.ondblclick = function () {
            if (confirm('Do you want to delete this control?')) {
                wrapper.remove() // Remove the element from the DOM
            }
        }

        return wrapper
    }

    let elementWrapper

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
        elementWrapper = createElementWrapper(button)
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
                const value = checkbox.checked
                eval(command) // Execute command on checkbox change
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
        })

        checkboxWrapper.appendChild(checkbox)
        checkboxWrapper.appendChild(label)
        elementWrapper = createElementWrapper(checkboxWrapper)
    } else if (elementType === 'dropdown') {
        const selectWrapper = document.createElement('div')
        selectWrapper.classList.add('dropdown-wrapper')

        const select = document.createElement('select')
        select.name = name
        const options = document
            .getElementById('elementOptions')
            .value.split(',')
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
                const value = select.value
                eval(command) // Execute command on dropdown change
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
        })

        elementWrapper = createElementWrapper(selectWrapper)
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

        // Update value display on input change
        range.addEventListener('input', function () {
            valueLabel.innerText = range.value
            try {
                const value = range.value
                eval(command) // Execute command on range input
            } catch (error) {
                console.error('Command execution failed: ', error)
            }
        })

        rangeLabel.appendChild(nameLabel)
        rangeLabel.appendChild(valueLabel)
        rangeWrapper.appendChild(rangeLabel)
        rangeWrapper.appendChild(range)
        elementWrapper = createElementWrapper(rangeWrapper)
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

        // Function to check and update output value periodically
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

        // Set interval to monitor the value at the specified FPS
        setInterval(checkValue, 1000 / fps)

        monitorWrapper.appendChild(label)
        monitorWrapper.appendChild(output)
        elementWrapper = createElementWrapper(monitorWrapper)
    }

    // Append the new element to the container
    uiContainer.appendChild(elementWrapper)

    // Close the modal after adding the element
    document.getElementById('popupModal').style.display = 'none'
}

// Make an element draggable when Ctrl is pressed
function dragMouseDown(e) {
    // Only start dragging if Ctrl key is held down
    if (!e.ctrlKey) return

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

    currentDragElement.style.left = newX + 'px'
    currentDragElement.style.top = newY + 'px'
}

// Stop dragging
function closeDragElement() {
    document.onmousemove = null
    document.onmouseup = null
}

Object.assign(window.ui, { showPopup, submitForm, cancel })
