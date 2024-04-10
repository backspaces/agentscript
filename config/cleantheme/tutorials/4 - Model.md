<!-- # Model -->

We saw Snippets of Patches, Turtles and Links. Now we want to use those
to create our first Model, our Hello World model.

There will be three parts:

-   Creating the HelloModel.js, and
-   Creating the hello.html file which uses HelloModel.js and
-   Using a browser to run hello.html

## Model

Our HelloModel.js is simple, yet uses all the elements of more complex models.

Lets look at [HelloModel.js](https://code.agentscript.org/models/HelloModel.js)

```javascript
import Model from 'https://code.agentscript.org/src/Model.js'
import * as util from 'https://code.agentscript.org/src/utils.js'

class HelloModel extends Model {
    population = 10 // number of turtles
    speed = 0.1 // step size in patch units
    wiggleAngle = 10 // wiggle angle in degrees
    linksToo = true // handy to show just turtles if false

    // default worldOptions: 33 x 33 patches with 0,0 origin at the center.
    constructor(worldOptions = undefined) {
        super(worldOptions)
    }

    setup() {
        // Have turtles "bounce" at the Patches edges. Default is to wrap
        this.turtles.setDefault('atEdge', 'bounce')

        // create "population" turtles placed on random patches
        this.turtles.create(this.population, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })

        // If links.too is true, create a link from every turtle to another turtle
        if (this.linksToo) {
            this.turtles.ask(t => {
                this.links.create(t, this.turtles.otherOneOf(t))
            })
        }
    }

    step() {
        // change heading randomly, moving forward by "speed"
        this.turtles.ask(t => {
            t.heading += util.randomCentered(this.wiggleAngle)
            t.forward(this.speed)
        })
    }
}

export default HelloModel
```

We first import two modules from our src/ folder

-   Model.js: This is used by all models and creates the Patches, Turtles and Links.
-   utils.js: A collection of useful utility functions. We'll use util.randomCentered

Then we create a [Class](https://javascript.info/class) which [inherits](https://javascript.info/class-inheritance) from the Model.js import (which manages the Patches, Turtles, Links). All Models start out inheriting from Model.js.

The class has 4 variables, a constructor, and two methods.

-   The constructor just calls the Model.js super class using the default "world".
    -   The default world is 33 x 33 patches with 0,0 origin at the center.
-   The 4 variables are used in the 2 methods to create the model's behavior
-   setup:
    -   creates "population" turtles
    -   If links.too is true, create a link from every turtle to another turtle
-   step:
    -   use "wiggleAngle" to ask each turtle to turn randomly from -(wiggleAngle/2) to +(wiggleAngle/2)
    -   use "speed" to move each turtle forward by speed patches
-   Finally we export HelloModel to be used elsewhere. For example, in the HTML below.

## HTML

The HTML used by the browser is quite simple. It provides a title, and a script which imports the HelloModel.js above, calls model.step 500 times, and it prints a start message and a random sample of the model's data.

```html
<html>
    <head>
        <title>Hello</title>
    </head>
    <body>
        <script type="module">
            import * as util from 'https://code.agentscript.org/src/utils.js'
            import Model from 'https://code.agentscript.org/models/HelloModel.js'

            util.printToPage('Running for 500 steps.')

            const model = new Model()
            await model.startup()
            model.setup()

            util.repeat(500, model.step)

            const sample = util.sampleModel(model)
            util.printToPage(sample)
        </script>
    </body>
</html>
```

You can run it [here](https://code.agentscript.org/views1/hello.html). Click the browser's reload button to get a new random sampling. They look like:

![Image](/config/cleantheme/static/RandomSample.jpg)

But wait! Where's the pretty View? This is just text!

Well, it is MVC, and we haven't discussed Views yet. That's next.
