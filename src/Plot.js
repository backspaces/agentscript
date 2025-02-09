import * as util from './utils.js'
import uPlot from '../vendor/uPlot.js'

await util.fetchCssStyle('../vendor/uPlot.css')

// const style = document.createElement('style')
// style.textContent = `
// .u-series th {
//     cursor: crosshair;
// }
// `
// document.head.appendChild(style)

//  'white silver gray black red maroon yellow orange olive lime green cyan teal blue navy magenta purple'
const penColors = ['red', 'blue', 'green', 'black', 'gray', 'yellow']
function namesToPens(names) {
    const obj = {}
    names.forEach((name, i) => (obj[name] = penColors[i]))
    console.log('arrayToPens', obj)
    return obj
}

class Plot {
    static defaultOptions() {
        return {
            title: undefined, // default: don't show title
            width: 600,
            height: 300,

            cursor: { show: true },
            legend: { show: true },

            precision: 2, // decimal digits
            stacked: false,

            series: [
                {
                    label: 'x', // in-legend display
                },
                // { // each pen creates a new series obj with these options available:
                //     label: 'y', // in-legend display
                //     stroke: 'red',
                //     width: 1,
                //     fill: 'rgba(255, 0, 0, 0.3)',
                //     dash: [10, 5],
                //     points: { space: 0 },
                //     paths: u => null,
                //     paths: uPlot.paths.bars({ size: [1] }),
                //     band: false, // for two series to create highlow-bands
                // },
            ],
            scales: {
                x: {
                    time: false, // don't use time x vals, use x numbers
                    // range: [0, 100], // limit x data location
                },
                y: {
                    // range: [0, 100], // limit y data location
                },
            },
            axes: [{ show: true }, { show: true }], // turn on/off axes & grid
        }
    }

    // simple pens looks like name/color pairs
    // pens: { // name-color pairs
    //     infected: 'red',
    //     susceptible: 'blue',
    //     resistant: 'gray',
    // },
    // complex pens are a series object above with label = key
    constructor(div, pens, options = {}) {
        if (Array.isArray(pens)) pens = namesToPens(pens)

        // pens are modified by plotting, create a copy for our use
        // pens = structuredClone(pens)

        options = Object.assign(Plot.defaultOptions(), options)
        if (util.isString(div)) div = document.getElementById(div)

        const useToolTips = !options.legend.show
        if (useToolTips) {
            injectTooltipCSS()
            options.plugins = [
                uPlotTooltipPlugin(div, options.precision, options.stacked),
            ]
        }

        // Use pens object to setup colors and shapes
        util.forLoop(pens, (val, key) => {
            // complex pens are series objects w/ label set to key
            if (util.isObject(val)) {
                // if val is object, the object is a user supplied options object
                val.label = key
                options.series.push(val)
            } else if (util.isArray(val)) {
                // if val is an array, deconstruct to a color & pen
                const [color, penTypeName] = val
                const penType = this.penType(penTypeName)
                penType.label = key
                penType.stroke = color
                options.series.push(penType)
            } else {
                // otherwise push an object with label = key, stroke = val
                options.series.push({
                    label: key,
                    stroke: val,
                })
            }
            const series = options.series.at(-1)
            series.value = (u, v) => (v ? v.toFixed(options.precision) : '--')
        })

        console.log('Plot options', options)

        const [data, dataArrays] = this.createDataObject(pens)
        let uplot = new uPlot(options, data, div)

        console.log('uplot', uplot)

        Object.assign(this, { div, options, pens, data, dataArrays, uplot })
    }

    createDataObject(pens) {
        const data = [[]]
        const dataArrays = {}
        util.forLoop(pens, (val, key) => {
            // data is an array of 1 + num pens empty arrays, 1 for xs + num ys
            data.push([])
            // dataArrays have num key/val pairs.
            // NOTE: key = the pen key, val is the associated data array above.
            // Adding to dataArrays arrays actually adds to the data!
            dataArrays[key] = data.at(-1) // -1 returns the last array in the data arrays
        })
        return [data, dataArrays]
    }

    numPens() {
        return this.data.length - 1
    }
    penType(type) {
        switch (type) {
            case 'lines':
                return { width: 1 }
            case 'thickLines':
                return { width: 2 }
            case 'dashedLines':
                return { dash: [10, 5] }
            case 'thickDashedLines':
                return { dash: [10, 5], width: 2 }
            case 'points':
                return {
                    points: { space: 0 },
                    paths: u => null,
                }
            case 'thickPoints':
                return {
                    width: 2,
                    points: { space: 0 },
                    paths: u => null, // no linesd between points
                }
            case 'bars': {
                return {
                    fill: 'rgba(255, 0, 0, 0.3)',
                    points: { space: 0 },
                    paths: uPlot.paths.bars({
                        size: [1],
                    }),
                }
            }
        }
        throw Error('penType: unknown type.')
    }
    penTypes() {
        return [
            lines,
            thickLines,
            dashedLines,
            thickDashedLines,
            pointsthickPoints,
            bars,
        ]
    }

    reset() {
        const { options, pens, div } = this

        this.uplot.destroy()

        const [data, dataArrays] = this.createDataObject(pens)
        const uplot = new uPlot(options, data, div)
        Object.assign(this, { data, dataArrays, uplot })

        // this.updatePlotFromModel(this.model)
        if (this.isMonitoring()) {
            this.stopMonitoring()
            this.monitorModel(this.model)
        }

        this.drawData()
    }

    scatterPlot(pens) {
        util.forLoop(pens, (val, key) => {
            // each val is an array of {x,y} objects. convert to array
            val = util.sortObjs(val, 'x')
            const xs = val.map(o => o.x)
            const ys = val.map(o => o.y)

            this.data[0] = xs
            this.data[1] = ys

            this.drawData()
        })
    }

    linePlot(pens, draw = true) {
        const xs = this.data[0]
        xs.push(xs.length)
        util.forLoop(pens, (val, key) => {
            this.dataArrays[key].push(val)
        })
        if (draw) this.drawData()
    }

    drawData() {
        this.uplot.setData(this.data)
    }

    // ====== agentscript model based plots ======

    updatePlotFromModel(model) {
        const pens = this.pens

        util.forLoop(pens, (val, key) => {
            if (model[key] == null) throw Error(`Plot key is null`)

            util.isFunction(model[key])
                ? (pens[key] = model[key]())
                : (pens[key] = model[key])
        })

        this.linePlot(pens)
    }

    monitorModel(model, fps = 60) {
        this.model = model

        const intervalMs = 1000 / fps
        // let lastTick = -1 // model.ticks
        let lastTick = 0 // model.ticks

        this.intervalID = setInterval(() => {
            if (model.ticks > lastTick) {
                this.updatePlotFromModel(model)
                lastTick = model.ticks
            }
        }, intervalMs)
    }

    isMonitoring() {
        return this.intervalID != null
    }

    stopMonitoring() {
        if (this.intervalID) this.intervalID = clearInterval(this.intervalID)
        this.intervalID = null
    }
}

// =============== ToolTips =======================

// Also see https://github.com/leeoniya/uPlot/issues/931
function uPlotTooltipPlugin(parentDiv, precision = 2, stacked = false) {
    // The tooltip div will be absolute, requiring the parent to be relative
    if (parentDiv !== document.body) {
        parentDiv.style.position = 'relative'
    }

    let tooltip = document.createElement('div')
    tooltip.className = 'uplot-tooltip'

    // Append tooltip to the plot's parent div
    parentDiv.appendChild(tooltip)

    return {
        hooks: {
            setCursor: u => {
                if (u.cursor.idx === null) {
                    tooltip.style.display = 'none'
                    return
                }

                tooltip.style.display = 'block'
                let { left, top } = u.cursor
                tooltip.style.left = left + 'px'
                tooltip.style.top = top + 'px'

                // let x = u.data[0][u.cursor.idx]
                // // let content = `x: ${x}\n`
                // let content = stacked ? `x: ${x}\n` : `x: ${x}  `
                let content
                Object.keys(u.series).forEach((_, index) => {
                    // if (index === 0) return // Skip the x-axis series
                    let y = u.data[index][u.cursor.idx]
                    y = y.toFixed(precision)
                    // content += `${u.series[index].label}: ${y}  \n`
                    content += `${u.series[index].label}: ${y}`
                    content += stacked ? '\n' : '  '
                })

                tooltip.textContent = content
            },
        },
    }
}

// via chatgpt
function injectTooltipCSS() {
    // Check if the tooltip CSS is already added to avoid duplicates
    if (!document.getElementById('uplot-tooltip-css')) {
        const style = document.createElement('style')
        style.id = 'uplot-tooltip-css'
        style.textContent = `
            .uplot-tooltip {
                position: absolute;
                cursor: crosshair; /* or 'none' if desired */
                background: rgba(0, 0, 0, 0.2);
                color: black;
                border: 2px solid black;
                font-weight: bold;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 14px;
                pointer-events: none;
                z-index: 10;
                white-space: pre; /* Preserve line breaks for each pen value */
            }
        `
        document.head.appendChild(style)
    }
}

export default Plot

// uPlot: see https://github.com/leeoniya/uPlot/tree/master/docs
// static stringToPlot(str) {
//     // example: '400x300, foodSeeker, nestSeeker'
//     const div = 'plotDiv'
//     const pens = {}
//     const options = {
//         title: undefined,
//         width: 800,
//         height: 200,
//         legend: {
//             show: true,
//         },
//     }

//     const parts = str.split(/,\s*/)
//     const size = parts.shift().split('x')
//     const [width, height] = size
//     options.width = Number(width)
//     options.height = Number(height)

//     const colors = ['red', 'blue', 'green']
//     parts.forEach((str, i) => (pens[str] = colors[i]))

//     return new Plot(div, pens, options)
// }
