import ThreeDraw from '../src/ThreeDraw.js'

const View = ThreeDraw

const viewOpts = {
    turtles: { meshClass: 'Obj3DMesh', useAxes: false },
    useAxes: false,
    useGrid: false,
    useWorldOutline: true,
    drawOptions: {
      turtlesShape: 'Dart',
      turtlesColor: 'random',
      turtlesSize: 3,
    }
}

const worldOpts = {
    minX: -16,
    maxX: 16,
    minY: -16,
    maxY: 16
}

export { View, viewOpts, worldOpts }
