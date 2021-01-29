import * as util from '../src/utils.js'
import World from '../src/World.js'
import HelloModel from '../models/HelloModel.js'
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
            links: model.links.typedSample({
                x0: Float32Array,
                y0: Float32Array,
                x1: Float32Array,
                y1: Float32Array,
            }),
        }
        postMessage(data, util.oofaBuffers(data))
        if (data.turtles.x.length !== 0) console.log('to data', data)
    }
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        params.world = new World(params.world)
        if (params.seed) util.randomSeed()
        if (params.img) Object.assign(self, setupView())

        model = new HelloModel(World.defaultOptions(params.maxX, params.maxY))
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
    // console.log(('worker:', params))
    const view = new TurtlesView(util.createCtx(0, 0), params.world, {
        patchSize: params.patchSize,
        useSprites: params.sprites,
    })
    const shapes = view.shapes
    const sprites25 = params.shapes25names.map(name =>
        shapes.imageNameToImage(name)
    )

    function draw(data) {
        function turtleViewValues(turtle, i, turtles) {
            return params.sprites
                ? {
                      sprite: sprites25[i % 25],
                      noRotate: params.noRotate,
                  }
                : {
                      shape: params.shape,
                      color: params.colors25[i % 25],
                      size: params.shapeSize,
                      noRotate: params.noRotate,
                  }
        }
        function linkViewValues(link, i, links) {
            return {
                color: params.colors25[i % 25],
                width: params.linksWidth,
            }
        }
        util.clearCtx(view.ctx, 'lightgray')
        if (!params.noLinks) {
            view.drawLinks(
                data.links,
                util.isObject(params.links) ? params.links : linkViewValues
            )
        }
        if (!params.noTurtles) view.drawTurtles(data.turtles, turtleViewValues)
    }

    return { view, draw }
}
