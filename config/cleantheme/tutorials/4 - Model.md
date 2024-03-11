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

![Image](/config/cleantheme/static/HelloModel.jpg)

We first import two modules from our src/ folder

-   Model.js: This is used by all models and creates the Patches, Turtles and Links.
-   utils.js: A collection of useful utility functions. We'll use util.randomCentered

Then we create a [Class](https://javascript.info/class) which [inherits](https://javascript.info/class-inheritance) from the Model.js import (which manages the Patches, Turtles, Links). All Models start out inheriting from Model.js.

The class has 3 variables, a constructor, and two methods.

-   The constructor just calles the Model.js super class
-   The three variables are used in the 2 methods to create the model's behavior
-   setup:
    -   creates "population" turtles
    -   create a link from every turtle to a random other turtle
-   step:
    -   use "wiggleAngle" to ask each turtle to turn randomly from -(wiggleAngle/2) to +(wiggleAngle/2)
    -   use "speed" to move each turtle forward
-   Finally we export HelloModel to be used elsewhere. For example, in the HTML below.

## HTML

The HTML used by the browser is quite simple. It provides a title, and a script which imports the HelloModel.js above, calls model.step 500 times, and it prints a start message and a random sample of the model's data.

![Image](/config/cleantheme/static/HelloHtml.jpg)

You can run it [here](https://code.agentscript.org/views1/hello.html). Click the browser's reload button to get a new random sampling. They look like:

![Image](/config/cleantheme/static/RandomSample.jpg)

## Run models locally

This is a good time to have your work locally on your desktop.

Start by creating a local folder and moving there, we'll call it models/. I'm using my home directory. You can create a folder with your system folders, or with the terminal:

Terminal:

-   cd # go to my home dir
-   mkdir models # make my models/ dir

System Folder:

![Image](/config/cleantheme/static/SystemFolder.jpg)

Lets start with the two examples we've just used: HelloModel.js & hello.html.

The easiest way to do this is to go to github above (https://github.com/backspaces/agentscript).

Once there, click on the models folder then on HelloModel.js then click on the upper right download icon (downward arrow). This places HelloModel.js in your downloads folder.

![Image](/config/cleantheme/static/GithubSource.jpg)

Similarly click on "backspaces/agentscript" to go back to the top of the repo and click on Views2 > hello.html and click the downloads icon again, adding it to the downloads folder.

![Image](/config/cleantheme/static/DownloadModel.jpg)

Move these to your models/ folder. You can use the terminal:

-   cd to your downloads folder (In my home dir on my system .. cd ~/Downloads)
-   mv hello.html HelloModel.js ~/models

Or you can use your system folders:

Open two folders, Downloads and you models folder.

Drag and Drop the two files to your models folder.

Should look like:

![Image](/config/cleantheme/static/ModelsFolder.jpg)

Lets make sure it works. Make sure you have a browser open. Then do any of the following:

-   Drag and drop the hello.html file from your folder to the browser.
-   Double click on hello.html
-   From the models dir: open hello.html

The model should be running in the browser.

It will have a "file url": file:///Users/owen/views1/hello.html

![Image](/config/cleantheme/static/FileURL.jpg)

Now lets modify/play with the two files. You'll need an editor. The best by far in the developer community is [vscode](https://code.visualstudio.com/). And you don't need to install it if you don't want to, you can [run it in your browser](https://vscode.dev/)

![Image](/config/cleantheme/static/VscodeDev.jpg)

Change HelloModel.js:

-   change population from 10 to 100

xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

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
