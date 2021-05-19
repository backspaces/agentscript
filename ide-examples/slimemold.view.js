import TwoDraw from '../src/TwoDraw.js'
import ColorMap from '../src/ColorMap.js'

const View = TwoDraw

// Here we define a color map that we use to color
// patches in the patchesColor setting further down.
let myColorMap = ColorMap.gradientColorMap(
    8, ['black', 'purple', 'yellow']
)

// This is where you configure how your model is
// rendered to the screen. Try playing around with
// these settings.
const viewOpts = {
    width: 600,
    drawOptions: {
        // patchesColor is where you specify what color to
        // paint each patch. In this case, we are mapping
        // each patch's pheromone from the range 0 -> 100 to
        // a color in the color map above
        patchesColor: (patch) => myColorMap.scaleColor(
            patch.pheromone, 0, 100
        ),

        turtlesSize: 2, // measured in patches
        
        // like patchesColor, this can be a color name,
        // like 'red', a hex code, or a function
        turtlesColor: 'random',
        
        // there are several built-in shapes: arrow, bug,
        // bug2, circle, dart, frame, frame2, person, person2,
        // ring, ring2, square, triangle
        turtlesShape: 'dart'
    }
}

// The dimensions of the world, measured in patches
const worldOpts = {
    minX: -20,
    maxX: 20,
    minY: -20,
    maxY: 20
}

export { View, viewOpts, worldOpts }
