import * as util from './utils.js'
import uPlot from 'https://cdn.skypack.dev/uplot'

// util.toWindow({ util, uPlot })

await util.fetchCssStyle('https://cdn.skypack.dev/uplot/dist/uPlot.min.css')

// export interface PathBuilderFactories {
//     linear?: LinearPathBuilderFactory;
//     spline?: SplinePathBuilderFactory;
//     stepped?: SteppedPathBuilderFactory;
//     bars?: BarsPathBuilderFactory;
//     points?: PointsPathBuilderFactory;
// }

class Plot {
    // see https://github.com/leeoniya/uPlot/tree/master/docs
    static defaultOptions() {
        return {
            title: 'Data',
            width: 600,
            height: 300,
            xRange: null, // static x values, use [0,100] format
            yRange: null, // ditto for y
            xIsTime: false,
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
                //     band: false, // for two series to create highlow-bands
                // },
            ],
            scales: {
                x: {
                    time: false, // don't use time x vals, use x ints
                    // range: [0, 100], // limit x data location
                },
                y: {
                    // range: [0, 100], // limit y data location
                },
            },
            axes: [{ show: true }, { show: true }], // turn on/off axes & grid
        }
    }

    // pens looks like:
    // pens: { // name-color pairs
    //     infected: 'red',
    //     susceptible: 'blue',
    //     resistant: 'gray',
    // },
    constructor(div, pens, options = {}) {
        options = Object.assign(Plot.defaultOptions(), options)
        options.scales.x.time = options.xIsTime

        if (options.xRange) options.scales.x.range = options.xRange
        if (options.yRange) options.scales.y.range = options.yRange

        const data = [[]]
        const dataArrays = {}

        util.forLoop(pens, (val, key) => {
            if (util.isObject(val)) {
                val.label = key
                options.series.push(val)
            } else {
                options.series.push({
                    label: key,
                    stroke: Array.isArray(val) ? val[0] : val,
                    fill: Array.isArray(val) ? val[1] : null,
                    // points: { space: 0.1 },
                })
            }
            data.push([])
            dataArrays[key] = data.at(-1)
        })

        if (util.isString(div)) div = document.getElementById(div)
        let uplot = new uPlot(options, data, div)
        Object.assign(this, { div, options, data, dataArrays, uplot })
    }

    get numPens() {
        return this.data.length - 1
    }

    // points: like pens but the next number to be plotted
    // points: {
    //     infected: 42, // often like: infected: model.infected
    //     susceptible: 55,
    //     resistant: 23,
    // },
    // You can just reuse pens obj with data not colors
    setData(points, draw = true) {
        const xs = this.data[0]
        xs.push(xs.length)

        util.forLoop(points, (val, key) => {
            this.dataArrays[key].push(val)
        })

        // If draw is false, don't draw, just update this.data
        // This allows updating every n steps, or until the model is done.
        if (draw) this.drawData()
    }
    drawData() {
        this.uplot.setData(this.data)
    }
}

export default Plot
