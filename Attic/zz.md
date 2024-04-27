xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

The easiest way to do this is to go to github above (https://github.com/backspaces/agentfscript).

Similarly click on "backspaces/agentscript" to go back to the top of the repo and click on Views2 > hello.html and click the downloads icon again, adding it to the downloads folder.

... etc

But wait! Where's the pretty View?

## View xxxxxxx

The reason for this is that AgentScript uses the Model, View, Controller architecture.
In this case, it means the Model, by itself, is simple data in (startup), updated each step(), printing the random sample when done (500 steps). The printout is our "View".

Thus far we've only discussed the Model. So views1/hello.html just shows the Model.

No worries, we'll use a nice View shortly. But in the mean time we have to figure out how run hello.html.

## Run demos locally

We've been running demos on code.agentscript.org. Now lets get these and run them on your desktop! Yay!

So first let's get the two files: HelloModel.js & hello.html. Lets get them from Github, see link above.

Running the hello.html file has two parts:

-   Getting the HelloModel.js and hello.html files into a folder.
-   Using a "developer server" on your desktop

Start by creating a local folder and moving there, we'll call it models/:

-   mkdir models
-   cd models

<!-- One way to do this is to get them from code.agentscript.org, them use the view-source technique introduced in the Browser tutorial:

Use the browser to view https://code.agentscript.org/models/HelloModel.js. It will show you the code and you can cut/paste it to to HelloModel.js in your new folder.

Then use the browser to view https://code.agentscript.org/views1/hello.html. It will actually show it running. Then you use view-source to view the html file which you can cut/past into the folder

Looks like this:

![Image](/config/cleantheme/static/ViewSource1.jpg)

This can also be done on one step on chrome:

-   HelloModel.js: `view-source:https://code.agentscript.org/models/HelloModel.js`
-   hello.html: `view-source:https://code.agentscript.org/views1/hello.html`
 -->

One approach is to click Github on the top of this page. (or brouse directly to https://github.com/backspaces/agentscript/)

Then click on models/ then click on HelloModel.js and hello.html in turn. Both show the code. Click the download icon (downward arrow) which puts them in your downloads, where you can move them to your folder.

![Image](/config/cleantheme/static/GithubSource.jpg)

If for some reason this doesn't work, you can just copy the raw files, and paste them into any text editor, then saving them to your folder (make sure you save to the right names!)

## Notes

Running the hello.html file has two parts:

-   Getting the HelloModel.js and hello.html files into a folder.
-   Using a "developer server" on your desktop

The use of "../" in the import URLs above are due to the file layouts:
All the External Model files are in the top lever models/ directory while
the two imports are in the top level src/ dir. So "../" gets me to the top level
and "../src" into the src/ directory.

Here is HelloModel.js running withiin the hello.html HTML file:
[views1/hello.html](https://code.agentscript.org/views1/hello.html)

You'll notice that the model simply runs 500 steps then prints out a random
sampling of its result.

Where's the pretty View?

## Views (Model/View/Controller)

The reason for this is that AgentScript uses the Model/View/Controller (MVC) architecture.
In this case, it means the Model, by itself, is simple Data in, and updated each step().
Thus far we've only discussed the Model. So views1/hello.html just shows the Model.

Here a 2D view: [views2/hello.html](https://code.agentscript.org/views2/hello.html)

Because the Model is separate, it is easy to create additional views as well.

Here are a 2.5D and 3D version with little change.

Here's 2.5D (simply adding Z): [views25/hello3d.html](../views25/hello3d.html)

And here a true 3D, with Yaw, Pitch, Roll and 3D turtles: [views3/hello3d.html](../views3/hello3d.html)

Because the MVC components are separate modules, it's quite easy to put Models
in different environments, as we show above with 2D, 2.5D and 3D Vviews.
Even more flexiblity will show up when we embed Models with 2D Views onto Maps!

BTW: MVC makes building Models simpler: use the views1 "View" above to run just the Model.
Then when it runs without problems, add a View.

# Foo

We saw small Snippets of Patches, Turtles and Links. Now we want to use those
to create our first Model, within the file PheromoneModel.js.

## Pheromone Model

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
    constructor(worldOptions = World.defaultOptions(15)) {
        super(worldOptions)
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

## Pheromone HTML

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

## Pheromone Output

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

## View the source

To see model's code, use the browser's [view-source capability](https://www.computerhope.com/issues/ch000746.htm). On Chrome and Edge, just press "Option + Control" + "U". For other browsers, use the view-source capability link above.

But hey, aren't we missing something? I can't see the turtles etc like in the Snippits!

This is expected, see the GettingStarted page where MVC (Model View Controller)
architecture is discussed. We'll next introduce an easy to use View.

<!-- [Foo](#pheromone-output)

[Bar](./GettingStarted.md) -->
