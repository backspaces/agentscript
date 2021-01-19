// import Chart from '../vendor/chart.esm.js'
import Chart from 'https://cdn.skypack.dev/chart.js'
import util from './util.js'

// Using https://github.com/chartjs/Chart.js
// https://github.com/leeoniya/uPlot
export default class Plot {
    static defaultOptions() {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [],
            },
            options: {
                // showLines: false,
                animation: { duration: 0 },
                hover: { animationDuration: 0 },
                responsiveAnimationDuration: 0,
                elements: {
                    line: {
                        tension: 0, // disables bezier curves
                        fill: false, // How to fill the area under the line
                    },
                    point: {
                        // radius: 10, // default 3
                        // pointStyle: 'cross',
                        // borderWidth: 3,
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
        const spec = Plot.defaultOptions()
        const dataArrays = {}
        const ticks = spec.data.labels

        util.forLoop(pens, (val, key) => {
            const dataset = {
                data: [],
                label: key,
                borderColor: val,
            }
            dataArrays[key] = dataset.data
            spec.data.datasets.push(dataset)
        })

        const chart = new Chart(canvas, spec)
        util.toWindow({ pens, dataArrays, spec, chart, plot: this })
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
