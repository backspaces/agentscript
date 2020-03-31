import util from '../src/util.js'
import World from '../src/World.js'

const inWorker = util.inWorker()
const inNode = util.inNode()
const inMain = !inWorker && !inNode
const where = inWorker ? 'worker' : inNode ? 'node' : 'main'

export default async function run(params) {
    console.log('running in', where)

    const module = await import(params.classPath)
    const Model = module.default

    let options = Model.defaultOptions()
    util.override(options, params)
    console.log('options', options)

    const world = params.maxX ? World.defaultOptions(params.maxX) : undefined

    if (params.seed) util.randomSeed()

    const model = new Model(world)
    Object.assign(model, options)
    console.log('world', model.world)

    const perf = util.fps()
    await model.startup()
    model.setup()
    if (inWorker || inNode) {
        util.repeat(params.steps, () => {
            model.step()
            model.tick()
            perf()
        })
    } else {
        await util.timeoutLoop(() => {
            model.step()
            model.tick()
            perf()
        }, params.steps)
    }

    const tls = n => n.toLocaleString()
    const { steps, fps, ms } = perf
    const secs = tls(ms / 1000)
    const name = params.className
    const pop = tls(model.population)
    const maxX = model.world.maxX
    const numPatches = tls(model.patches.length)
    const numTurtles = tls(model.turtles.length)
    const numLinks = tls(model.links.length)
    const sample = util.sampleModel(model)

    const results = `${name} ${where}: fps:${fps} secs:${secs} pop:${pop} maxX:${maxX}
    steps:${steps} patches:${numPatches} turtles:${numTurtles} links:${numLinks}

model sample: ${util.objectToString(sample)}`

    console.log('\n' + results + '\n')

    if (inWorker) postMessage(results)
    // else if (inMain) util.printToPage(sample)

    return results
}
