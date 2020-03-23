import Chart from '../dist/chart.esm.js'
import util from './util.js'

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

    // Template looks like:
    // const template = {
    //     susceptible: { color: 'blue' },
    //     infected: { color: 'red' },
    //     resistant: { color: 'black' },
    // }
    constructor(canvas, template) {
        const spec = Plot.defaultOptions()
        const dataArrays = {}
        const ticks = spec.data.labels

        util.forLoop(template, (val, key) => {
            const dataset = {
                data: [],
                label: key,
                borderColor: val.color,
            }
            dataArrays[key] = dataset.data
            spec.data.datasets.push(dataset)
        })

        const plot = new Chart(canvas, spec)
        util.toWindow({ template, dataArrays, spec, plot })
        Object.assign(this, { plot, dataArrays, ticks })
    }

    // points: just reuse template with values of next number
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
        this.plot.update()
    }
}
