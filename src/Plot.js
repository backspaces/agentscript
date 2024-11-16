import * as util from './utils.js'
import uPlot from '../vendor/uPlot.min.js'

await util.fetchCssStyle('../vendor/uPlot.css')

class Plot {
    // uPlot: see https://github.com/leeoniya/uPlot/tree/master/docs
    static stringToPlot(str) {
        // example: '400x300, foodSeeker, nestSeeker'
        const div = 'plotDiv'
        const pens = {}
        const options = {
            title: undefined,
            width: 800,
            height: 200,
            legend: {
                show: true,
            },
        }

        const parts = str.split(/,\s*/)
        const size = parts.shift().split('x')
        const [width, height] = size
        options.width = Number(width)
        options.height = Number(height)

        const colors = ['red', 'blue', 'green']
        parts.forEach((str, i) => (pens[str] = colors[i]))

        return new Plot(div, pens, options)
    }
    static defaultOptions() {
        return {
            title: undefined, // default: don't show title
            width: 600,
            height: 300,

            cursor: { show: true },
            legend: { show: true },

            xRange: null, // static x values, use [0,100] format
            yRange: null, // ditto for y
            xIsTime: false,
            xAxisLabel: 'x',

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
    // complex pens are a series object above with label = key
    // pens: { // name-color pairs
    //     infected: 'red',
    //     susceptible: 'blue',
    //     resistant: 'gray',
    // },
    constructor(div, pens, options = {}) {
        // // Inject tooltip CSS if not already present
        // injectTooltipCSS()

        options = Object.assign(Plot.defaultOptions(), options)
        if (util.isString(div)) div = document.getElementById(div)

        const useToolTips = !options.legend.show

        if (useToolTips) {
            injectTooltipCSS()
            if (div !== document.body) {
                div.style.position = 'relative'
            }
            options.plugins = [uPlotTooltipPlugin(div)]
        }

        options.scales.x.time = options.xIsTime
        options.series[0].label = options.xAxisLabel

        // Set parent position to relative if it's not document.body
        // if (div !== document.body) {
        //     div.style.position = 'relative'
        // }

        if (options.xRange) options.scales.x.range = options.xRange
        if (options.yRange) options.scales.y.range = options.yRange

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
        })

        // // Pass pens to the tooltip plugin for dynamic series handling
        // options.plugins = [uPlotTooltipPlugin(div)]

        const [data, dataArrays] = this.createDataObject(pens)
        let uplot = new uPlot(options, data, div)

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

    updatePlot(pens, model) {
        util.forLoop(pens, (val, key) => {
            pens[key] = model[key]
        })
        this.linePlot(pens)
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

    // monitorPlot(pens, model, fps = 60) {
    monitorPlot(model, fps = 60) {
        const intervalMs = 1000 / fps
        let lastTick = -1 // model.ticks

        this.intervalID = setInterval(() => {
            if (model.ticks > lastTick) {
                this.updatePlot(this.pens, model)
                lastTick = model.ticks
            }
        }, intervalMs)
    }
    stopMonitoring() {
        if (this.intervalID) this.intervalID = clearInterval(this.intervalID)
    }
}

function uPlotTooltipPlugin(parentDiv) {
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

                let x = u.data[0][u.cursor.idx]
                let content = `x: ${x}\n`

                Object.keys(u.series).forEach((_, index) => {
                    if (index === 0) return // Skip the x-axis series
                    let y = u.data[index][u.cursor.idx]
                    content += `${u.series[index].label}: ${y}\n`
                })

                tooltip.textContent = content
            },
        },
    }
}

function injectTooltipCSS() {
    // Check if the tooltip CSS is already added to avoid duplicates
    if (!document.getElementById('uplot-tooltip-css')) {
        const style = document.createElement('style')
        style.id = 'uplot-tooltip-css'
        style.textContent = `
            .uplot-tooltip {
                position: absolute;

                // background: rgba(0, 0, 0, 0.7);
                // color: white;
                background: rgba(0, 0, 0, 0.2);
                color: black;
                border: 2px solid black;
                font-weight: bold;

                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 10;
                white-space: pre; /* Preserve line breaks for each pen value */
            }
        `
        document.head.appendChild(style)
    }
}

export default Plot
