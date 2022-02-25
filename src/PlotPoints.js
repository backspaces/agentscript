import Chart from 'https://unpkg.com/chart.js@3.6.1/auto/auto.esm.js'
import * as util from '../src/utils.js'

export default class Plot {
    static defaultOptions() {
        return {
            type: 'scatter',
            data: {
                labels: [],
                datasets: [],
            },
            options: {
                showLine: true,
                animation: {
                    duration: 0,
                    active: {
                        duration: 0,
                    },
                    resize: {
                        duration: 0,
                    },
                },
                elements: {
                    line: {
                        tension: 0, // disables bezier curves
                        fill: false, // How to fill the area under the line
                    },
                    point: {
                        // radius: 10, // default 3
                        // pointStyle: 'cross', // default circle
                        // borderWidth: 3, // default 1
                    },
                },
            },
        }
    }

    // ======================

    // Pens looks like:
    // pens: {
    //     infected: 'red',
    //     susceptible: 'blue',
    //     resistant: 'gray',
    // },
    constructor(canvas, pens) {
        const opts = Plot.defaultOptions()
        const dataArrays = {}
        const ticks = opts.data.labels

        util.forLoop(pens, (val, key) => {
            const dataset = {
                data: [],
                label: key,
                borderColor: val,
            }
            dataArrays[key] = dataset.data
            opts.data.datasets.push(dataset)
        })

        const chart = new Chart(canvas, opts)
        util.toWindow({ pens, dataArrays, opts, Chart, chart, plot: this })
        Object.assign(this, { chart, dataArrays, ticks })
    }

    // points: like pens but the next number to be plotted
    // points: {
    //     infected: 42, // often like: infected: model.infected
    //     susceptible: 55,
    //     resistant: 23,
    // },
    addPoints(points) {
        const { ticks, dataArrays } = this
        if (ticks.length === 0) {
            console.log(ticks, dataArrays)
            const pointKeys = Object.keys(points).sort()
            const dataKeys = Object.keys(dataArrays).sort()
            if (!util.arraysEqual(pointKeys, dataKeys)) {
                console.log(pointKeys, dataKeys)
                throw Error('Plot.addPoints data names unequal')
            }
        }
        ticks.push(ticks.length)
        util.forLoop(points, (val, key) => {
            dataArrays[key].push(val)
        })
        this.chart.update()
    }

    // reset chart to initial condition
    reset() {
        util.forLoop(this.dataArrays, val => (val.length = 0))
        this.ticks.length = 0
        this.chart.reset()
        this.chart.update()
    }
}
