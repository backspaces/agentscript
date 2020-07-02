import ThreeDraw from '../src/ThreeDraw.js'

export default function newView(model, viewOptions = {}) {
    return new ThreeDraw(model, viewOptions, {
        turtleShape: 'point',
        // turtleColor: 'red',
        // linkColor: 'red',
    }) // use default drawOptions
}
