This is a simple Hello World example of class Model.

### The HelloModel.js file:

``` javascript
import * as util from 'https://code.agentscript.org/src/utils.js'
import Model from 'https://code.agentscript.org/src/Model.js'

class HelloModel extends Model {
    population = 10 // number of turtles
    speed = 0.1 // step size in patch units
    wiggleAngle = util.degToRad(10) // Wiggle angle in radians

    // We can use Model's constructor, due to using Model's default World
    // constructor() {
    //     super() // use default world options.
    // }

    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })

        this.turtles.ask(t => {
            this.links.create(t, this.turtles.otherOneOf(t))
        })
    }

    step() {
        this.turtles.ask(t => {
            t.theta+= util.randomCentered(this.wiggleAngle)
            t.forward(this.speed)
        })
    }
}

export default HelloModel
```

Lets break this down into it's component parts.

### Modules: import and export

First, as this is a Module system, we have two imports to the files src/utils.js and class src/Model.js.

Our code creates a subclass of class Model, then exports it
``` javascript
import * as util from 'https://code.agentscript.org/src/utils.js'
import Model from 'https://code.agentscript.org/src/Model.js'

class HelloModel extends Model {
  ...
}

export default HelloModel
```

The imports are on our home repository, https://code.agentscript.org, so can be run without any workflow or downloads.

Our single default export is the HelloModel ready to be used in the browser via html.

### The HelloModel class

We "extend" class {@link Model}. The documentation explains how models have "abstract methods", startup, setup, and step. These are overridden by the modeler.

At the top of the class are properties that can be modified after creating the model. You'll notice we don't need a class constructor because we use the same values class Model would use .. the default {@link World} properties.

```javascript
class HelloModel extends Model {
    population = 10 // number of turtles
    speed = 0.1 // step size in patch units
    wiggleAngle = util.degToRad(10) // Wiggle angle in radians

    // We can use Model's constructor, due to using Model's default World
    // constructor() {
    //     super() // use default world options.
    // }

    setup() {
        ...
    }

    step() {
        ...
    }
}
```

Our model has three properties:

  - **population**: the number of turtles
  - **speed**: how far they go during each step
  - **wiggleAngle**: how much they wiggle each step.


Note wiggleAngle is 10 degrees, converted to radians. Radians are standard in JavaScript trigonometry, see JavaScript's [built-in Math module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math) for details.

No worries tho, we provide utilities to work in degrees and even other geometries like GIS latitude & longitude, pixel coordinates, and the heading coordinate system used by NetLogo.

### setup() & step()

Setup() is used to initialize the model, creating turtles & links
(patches are created by the constructor when the Patches array is initialized)
```javascript
    setup() {
        this.turtles.setDefault('atEdge', 'bounce')

        this.turtles.create(this.population, t => {
            const patch = this.patches.oneOf()
            t.setxy(patch.x, patch.y)
        })

        this.turtles.ask(t => {
            this.links.create(t, this.turtles.otherOneOf(t))
        })
    }
```
First we set a `default`, a property shared by all turtles. In this case, we tell
the turtles to "bounce" when they are about to leave the World. The default is to
wrap around to the other side of the World. You can remove this to see how wrap works.

Next we create `population` turtles, initializing them to be over a random patch.
They will be at random angles unless setup uses `t.theta= ...`

Finally, we create links between random pairs of turtles.

Even thought this is a very simple model, it exercises all three of the AgentSets: Patches, Turtles, and Links. Great for debugging!

After we setup our model, we define it's dynamic behavior via the step() method.
In this case, we ask each turtle to wiggle (change it's direction by -5 to +5 degrees)
and move forward by the speed parameter (0.1 patch size)

```javascript
    step() {
        this.turtles.ask(t => {
            t.theta+= util.randomCentered(this.wiggleAngle)
            t.forward(this.speed)
        })
    }
```

### Running the model

Well, now that we have our model, how do we run it? We'll run it in the browser.

This takes two steps:
* Create an html file that imports the HelloModel.js and runs it for 500 steps
* Create a local server to run that html file.

To get a peak at what this looks like, we can run it on our server:
[http://code.agentscript.org/tutorials/examples/hello.html](http://code.agentscript.org/tutorials/examples/hello.html)

Next, {@tutorial 02-HelloHtml}: creating an html file to run HelloModel.js
