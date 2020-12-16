import util from '../src/util.js'
import World from '../src/World.js'

const inWorker = util.inWorker()
const inNode = util.inNode()
const inMain = !inWorker && !inNode
const where = inWorker ? 'worker' : inNode ? 'node' : 'main'

function cacheCount(model) {
    const { patches, turtles, links } = model
    const p0 = patches[0]
    let count = 0
    if (p0.turtles) {
        // should just be equal to the number of turtles
        patches.ask(p => (count += p.turtles.length))
    }
    if (Object.keys(p0).includes('neighbors')) {
        patches.ask(p => (count += p.neighbors.length))
    }
    if (Object.keys(p0).includes('neighbors4')) {
        patches.ask(p => (count += p.neighbors4.length))
    }
    if (p0.rectCache) {
        // assume only one
        patches.ask(p => (count += util.arrayLast(p.rectCache).length))
    }
    return count
}
export default async function run(params) {
    console.log('running in', where)

    const module = await import(params.classPath)
    const Model = module.default

    // let options = Model.defaultOptions()
    // util.override(options, params)

    const world = params.maxX ? World.defaultOptions(params.maxX) : undefined

    if (params.seed) util.randomSeed()

    const model = new Model(world)
    util.override(model, params)

    if (typeof window !== 'undefined') util.toWindow({ util, model }) // debug

    const perf = util.fps()
    await model.startup()
    model.setup()
    if (inWorker || inNode) {
        util.repeat(params.steps, () => {
            model.step()
            perf()
        })
    } else {
        await util.timeoutLoop(() => {
            model.step()
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
    const cache = tls(cacheCount(model))

    const results = `${name} ${where}: fps:${fps} secs:${secs} pop:${pop} maxX:${maxX}
    steps:${steps} patches:${numPatches} turtles:${numTurtles} links:${numLinks} cache:${cache}

model sample: ${util.objectToString(sample)}`

    if (inNode) console.log('\n' + results + '\n')
    if (inWorker) postMessage(results)

    return results
}
