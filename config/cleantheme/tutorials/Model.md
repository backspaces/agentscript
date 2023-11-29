<!-- # Model -->

We saw small snippets of Patches, Turtles and Links. Now we want to use those
to create our first Model, within the file PheromoneModel.js.

```javascript
// Import the modules we need.
import Model from '../src/Model.js'
import World from '../src/World.js'
import * as util from '../src/utils.js'

// Create the PheromoneModel subclass of class Model
// Note we export the model so it can be imported elsewhere
export default class PheromoneModel extends Model {
    // Here are the variables we'll use.
    // They are accessed via "this.population" etc.
    population = 30 // number of turtles
    rotateAngle = 50 // rotate between -25 & +25
    addPheromone = 10 // how mutch to add to patches under a turtle
    evaporateToo = true // decrease all patches pheromone too?
    evaporateDelta = 0.99 // how much to decrease pheromone as fraction

    // worldOptions are the min/max values for x, y, z
    // defaultOptions(15) is a helper for x, y, z between -15 to +15
    constructor(worldDptions = World.defaultOptions(15)) {
        super(worldDptions)
    }

    // setup is called once to initialize the model.
    setup() {
        // create population turtles, placing them randomly on the patches
        this.turtles.create(this.population, turtle => {
            const patch = this.patches.oneOf()
            turtle.setxy(patch.x, patch.y)
        })

        // initialize the patches with the pheromone value of 0
        this.patches.ask(patch => {
            patch.pheromone = 0
        })
    }

    // step is called multiple times, animating our model
    step() {
        // ask turtles to go forward 1 and randomly rotate.
        // then add to the pheromone of the patch the turtle ends on.
        this.turtles.ask(turtle => {
            turtle.forward(1)
            turtle.rotate(util.randomCentered(this.rotateAngle))
            turtle.patch.pheromone += this.addPheromone
        })
        // If we want the pheromone to evaporate each step,
        // reduce patch.pheromone by the multiple of evaporateDelta
        if (this.evaporateToo) {
            this.patches.ask(patch => {
                patch.pheromone *= this.evaporateDelta
            })
        }
    }
}
```

Then we run it in the browser for 500 steps printing out a
random sample when done.

```html
<html>
    <head>
        <title>Pheromone</title>
    </head>
    <body>
        <script type="module">
            import * as util from '../src/utils.js'
            import Model from '../models/PheromoneModel.js'

            util.printToPage('Running 500 steps.')

            const model = new Model()
            model.setup()

            util.repeat(500, model.step)

            const sample = util.sampleModel(model)
            util.printToPage(sample)
        </script>
    </body>
</html>
```

When we run this in the browser, the results look like:

```json
Running 500 steps.
{
  "ticks": 500,
  "model": [
    "world",
    "patches",
    "turtles",
    "links",
    "ticks",
    "stepTarget",
    "step",
    "toRads",
    "fromRads",
    "toAngleRads",
    "fromAngleRads",
    "toCCW",
    "population",
    "rotateAngle",
    "addPheromone",
    "evaporateToo",
    "evaporateDelta"
  ],
  "patches": 961,
  "patch": {
    "id": 211,
    "pheromone": 16.715235186523177
  },
  "turtles": 30,
  "turtle": {
    "id": 0,
    "theta": 2.690935810442892,
    "x": -3.9897254404119096,
    "y": 2.9446740602205304,
    "z": 0
  },
  "links": 0
}
```

Each run will differ due to being a random sampling.

Lets run the [PheromoneModel:](https://code.agentscript.org/views2/pheromone.html)
It runs 500 steps and stops. Reload it to run again.

To see the actual code, use the browser's [view-source capability](https://www.computerhope.com/issues/ch000746.htm). On Chrome and Edge, just press "Control" + "U". For other browsers, use the link above.

But hey, aren't we missing something? I can see the turtles etc like in the Snippits!

This is expected, see the GettingStarted page where MVC (Model View Controller)
architecture is discussed. We'll next introduce an easy to use View.
