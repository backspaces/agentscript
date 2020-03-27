import util from '../src/util.js'
import World from '../src/World.js'

const inWorker = util.inWorker()

export default async function run(params) {
    console.log('running in', inWorker ? 'worker' : 'main')

    const module = await import(params.classPath)
    const Model = module.default

    let options = Model.defaultOptions()
    util.override(options, params)
    console.log('options', options)

    const world = params.maxX ? World.defaultOptions(params.maxX) : undefined

    const model = new Model(world)
    Object.assign(model, options)
    console.log('world', model.world)

    const perf = util.fps()
    await model.startup()
    model.setup()
    if (inWorker) {
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
    console.log(
        `\ndone: steps: ${steps}, fps: ${fps}, seconds: ${tls(ms / 1000)}`
    )

    console.log('\nagentSet sizes')
    console.log('    patches', tls(model.patches.length))
    console.log('    turtles', tls(model.turtles.length))
    console.log('    links', tls(model.links.length))

    const sample = util.sampleModel(model)
    if (inWorker) postMessage(sample)
    else util.printToPage(sample)
}
