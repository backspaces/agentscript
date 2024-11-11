import uPlot from '../vendor/uPlot.min.js'
import * as util from '../src/utils.js'

await util.fetchCssStyle('../vendor/uPlot.css')

// Plot configuration and instance
const plotConfig = {
    plotInterval: 1000, // Update interval in milliseconds
    stepInterval: 10, // Only update every 10 anim.ticks
    minY: 0,
    maxY: 200, // Adjusted to fit the range of foodSeekers
    width: 200,
    height: 100,
    dataFunction: () => window.ui.model.foodSeekers, // Using model.foodSeekers as the data source
}

let plot

// Function to initialize the plot
function initializePlot() {
    const uiContainer = document.getElementById('uiContainer')
    if (!uiContainer) {
        console.error('uiContainer not found')
        return
    }

    // Dynamically create #plotContainer if it doesn’t exist
    let plotContainer = document.getElementById('plotContainer')
    if (!plotContainer) {
        plotContainer = document.createElement('div')
        plotContainer.id = 'plotContainer'
        uiContainer.appendChild(plotContainer)
    }

    // Initialize the uPlot instance
    plot = new uPlot(
        {
            title: 'Food Seekers Plot',
            width: plotConfig.width,
            height: plotConfig.height,
            scales: { y: { min: plotConfig.minY, max: plotConfig.maxY } },
            series: [
                {}, // empty series for x-axis
                { label: 'Food Seekers', stroke: 'blue' },
            ],
        },
        [[], []], // Initial empty data
        plotContainer
    )

    setInterval(() => {
        updatePlot() // Pass anim to updatePlot
    }, plotConfig.plotInterval)
}

// Function to update the plot data
function updatePlot(anim = window.ui.anim) {
    // Check if we should update based on anim.ticks
    if (anim.ticks % plotConfig.stepInterval === 0) {
        const newData = plotConfig.dataFunction()

        plot.setData([
            Array.from({ length: anim.ticks }, (_, i) => i), // X-axis
            Array.from({ length: anim.ticks }, () => newData), // Y-axis
        ])
    }
}

export { initializePlot, updatePlot }
