import TwoDraw from 'https://cdn.skypack.dev/agentscript/src/TwoDraw.js'

let worldOpts = {
    minX: -10,
    maxX: 10,
    minY: -10,
    maxY: 10
}

let View = TwoDraw
let viewOpts = {
    patchSize: 20,
    useSprites: true,
    drawOpts: {
      patchesColor: 'white',
      turtlesSize: 1
    }
}

export { worldOpts, View, viewOpts }