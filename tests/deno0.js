import * as util from '../src/utils.js'
// import Animator from '../src/Animator.js'
import Model from '../models/HelloModel.js'

const model = new Model()
await model.startup()
model.setup()

await util.timeoutLoop(
    () => {
        model.step()
    },
    500 // looops
)

console.log(model.ticks)
const sample = util.sampleModel(model)
console.log(sample)

// const anim = new Animator(
//     () => {
//         model.step()
//     },
//     500, // run 500 steps
//     30 // 30 fps
// )
// await util.waitPromise(() => model.ticks === 500)
