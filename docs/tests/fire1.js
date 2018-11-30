import { util } from '../dist/agentscript.esm.js'
import FireModel from '../models/FireModel.js'

util.randomSeed(1) // for consistant results over runs

const options = FireModel.defaultWorld(125)
const model = new FireModel(options)
model.setup()
console.log('worker model:', model)
console.log('worker self:', self)

const perf = util.fps()
while (!model.isDone()) {
    model.step()
    const data = model.patches.props('type')
    postMessage(data)
    perf()
}

console.log('worker: done. steps, fps', perf.steps, perf.fps)
postMessage('done')
