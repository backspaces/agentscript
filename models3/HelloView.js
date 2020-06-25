import ThreeDraw from '../src/ThreeDraw.js'

export default function newView(model, viewOptions = {}) {
    return new ThreeDraw(model, viewOptions, {
        turtleShape: 'point',
        turtleColor: [1, 0, 0],
    }) // use default drawOptions
}
