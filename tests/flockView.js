import util from '../src/util.js'
import World from '../src/World.js'
import FlockModel from '../models/FlockModel.js'
import TurtlesView from '../src/TurtlesView.js'
console.log('worker self', self)

let model, params
let steps = 0

function postData() {
    if (params.img) {
        draw(model)
        view.getImageBitmap().then(imgBitMap => {
            postMessage(imgBitMap, [imgBitMap])
        })
    } else {
        const data = {
            turtles: model.turtles.typedSample({
                x: Float32Array,
                y: Float32Array,
                theta: Float32Array,
            }),
        }
        postMessage(data, util.oofaBuffers(data))

        if (data.turtles.x.length !== 0) console.log('to data', data)
    }
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        if (params.seed) util.randomSeed()
        if (params.img) Object.assign(self, setupView())

        model = new FlockModel(World.defaultOptions(params.maxX, params.maxY))
        model.population = params.population
        model.setup()

        console.log('worker: params', params)
        console.log('worker: model:', model)
        postData()
    } else if (e.data.cmd === 'step') {
        if (++steps === params.steps) {
            postMessage('done')
        } else {
            model.step()
            postData()
        }
    } else {
        console.log('Oops, unknown message: ', e)
    }
}

function setupView() {
    const view = new TurtlesView(
        util.createCtx(0, 0),
        new World(World.defaultOptions(params.maxX, params.maxY)),
        { patchSize: params.patchSize }
    )
    function draw(data) {
        function turtleViewValues(turtle, i, turtles) {
            return {
                shape: params.shape,
                color: params.colors25[i % 25],
                size: params.shapeSize,
                noRotate: params.noRotate,
            }
        }
        util.clearCtx(view.ctx)
        view.drawTurtles(data.turtles, turtleViewValues)
    }
    return { view, draw }
}
