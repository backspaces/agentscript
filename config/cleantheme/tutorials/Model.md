<!-- # Model -->

We saw small snippets of Patches, Turtles and Links. Now we want to use those
to create our first Model, within the file PheromoneModel.js.

### Pheromone Model

```javascript
import Model from '../src/Model.js' // Import the modules we need.
import World from '../src/World.js'
import * as util from '../src/utils.js'

// Create PheromoneModel subclass of Model. "export" allows it to be imported elsewhere
export default class PheromoneModel extends Model {
    // Here are the variables we'll use. They are accessed via "this.population" etc.
    population = 30 // number of turtles
    rotateAngle = 50 // rotate between -25 & +25
    addPheromone = 10 // how mutch to add to patches under a turtle
    evaporateToo = true // decrease all patches pheromone too?
    evaporateDelta = 0.99 // how much to decrease pheromone as fraction

    // worldOptions: min/max for x, y. defaultOptions(15) helper sets x, y between -15 to +15
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
        this.turtles.ask(turtle => {
            // ask all turtles to go forward 1 and randomly rotate.
            // then add to the pheromone of the patch the turtle ends on.
            turtle.forward(1)
            turtle.rotate(util.randomCentered(this.rotateAngle))
            turtle.patch.pheromone += this.addPheromone
        })

        if (this.evaporateToo) {
            // reduce patch.pheromone by the multiple of evaporateDelta
            this.patches.ask(patch => {
                patch.pheromone *= this.evaporateDelta
            })
        }
    }
}
```

### Pheromone HTML

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

            util.repeat(500, model.step) // run the model 500 stes

            const sample = util.sampleModel(model) // randomly sample model
            util.printToPage(sample) // print out the sample
        </script>
    </body>
</html>
```

### Pheromone Output

When we run this in the browser, the results look like:

```json
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

[Try it yourself](https://code.agentscript.org/views1/pheromone.html)

Each run will differ due to being a random sampling.

### View the source

To see model's code, use the browser's [view-source capability](https://www.computerhope.com/issues/ch000746.htm). On Chrome and Edge, just press "Option + Control" + "U". For other browsers, use the view-source capability link above.

But hey, aren't we missing something? I can't see the turtles etc like in the Snippits!

This is expected, see the GettingStarted page where MVC (Model View Controller)
architecture is discussed. We'll next introduce an easy to use View.

<!-- [Foo](#pheromone-output)

[Bar](./GettingStarted.md) -->
