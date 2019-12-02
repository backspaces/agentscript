import World from '../src/World.js'
import util from '../src/util.js'
import FireModel from '../models/FireModel.js'

util.randomSeed() // for consistant results over runs

const options = World.defaultOptions(125)
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
