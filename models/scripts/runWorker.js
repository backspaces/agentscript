importScripts('../../dist/agentscript.umd.js')
var util = AS.util // var: avoid similar use in the importScripts sources

onmessage = e => {
    if (e.data.cmd === 'init') {
        util.runModel(e.data.params).then(sample => postMessage(sample))
    } else {
        console.log('Oops, unknown message: ', e)
    }
}
