import ThreeDraw from '../src/ThreeDraw.js'

export default function newView(model, viewOptions = {}) {
    return new ThreeDraw(model, viewOptions, {
        turtleShape: 'point',
        // turtlesColor: 'red',
        // linksColor: 'red',
    }) // use default drawOptions
}
