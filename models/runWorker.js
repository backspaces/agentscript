import * as util from '../src/utils.js'

async function run(classPath) {
    console.log('worker: start', classPath)

    // note util.runModel will be run in the src/ dir, not the models/ dir
    // this is why we use import.meta.resolve for absolute paths
    const model = await util.runModel(classPath)

    self.postMessage(util.sampleModel(model))
    self.close()
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        run(e.data.classPath) // don't await, stops worker
    } else {
        console.log('Oops, unknown message: ', e)
    }
}
