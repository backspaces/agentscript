import util from '../src/util.js'
import World from '../src/World.js'
import HelloModel from '../models/HelloModel.js'
import TurtlesView from './TurtlesView.js'
console.log('worker self', self)

let model, params // , view
let steps = 0

function postData() {
    if (params.img) {
        draw(model)
        view.getImageBitmap().then(imgBitMap => {
            postMessage(imgBitMap, [imgBitMap])
        })
    } else {
        const data = {
            turtles: model.turtles.propsObject({
                x: Float32Array,
                y: Float32Array,
                theta: Float32Array,
            }),
            links: model.links.propsObject({
                x0: Float32Array,
                y0: Float32Array,
                x1: Float32Array,
                y1: Float32Array,
            }),
        }
        postMessage(data, [
            data.turtles.x.buffer,
            data.turtles.y.buffer,
            data.turtles.theta.buffer,
            data.links.x0.buffer,
            data.links.y0.buffer,
            data.links.x1.buffer,
            data.links.y1.buffer,
        ])
        if (data.turtles.x.length !== 0) console.log('to data', data)
    }
}

onmessage = e => {
    if (e.data.cmd === 'init') {
        params = e.data.params
        if (params.seed != null) util.randomSeed(params.seed)
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
    const view = new TurtlesView(
        util.createCtx(0, 0),
        params.cellSize,
        World.defaultOptions(params.maxX, params.maxY)
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
        function linkViewValues(link, i, links) {
            return {
                color: params.colors25[i % 25],
                width: params.linkWidth,
            }
        }
        util.fillCtx(view.ctx, 'lightgray')
        view.drawLinks(data.links, linkViewValues)
        view.drawTurtles(data.turtles, turtleViewValues)
    }
    return { view, draw }
}

// class View {
//     constructor() {
//         this.ctx = util.createCtx(0, 0)
//         this.view = new TurtlesView(
//             this.ctx,
//             params.cellSize,
//             World.defaultOptions(params.maxX, params.maxY)
//         )
//     }

//     draw(data) {
//         function turtleViewValues(turtle, i, turtles) {
//             return {
//                 shape: params.shape,
//                 color: params.colors25[i % 25],
//                 size: params.shapeSize,
//                 noRotate: params.noRotate,
//             }
//         }
//         function linkViewValues(link, i, links) {
//             return {
//                 color: params.colors25[i % 25],
//                 width: params.linkWidth,
//             }
//         }
//         util.fillCtx(this.ctx, 'lightgray')
//         this.view.drawLinks(data, linkViewValues)
//         this.view.drawTurtles(data, turtleViewValues)
//     }
// }
