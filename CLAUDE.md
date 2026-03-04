# AgentScript (AS) Overview

This is a helper file for claude code (and others) to create AS models via prompts rather than by writing HTML, CSS, JS code.

So, what _is_ AS?

AS is a Model, View, Controller (MVC) architecture in JavaScript (JS) for Agent based modeling in the browser. It supports 2D, 2.5D and 3D models.

A Model contains Patches, Turtles and Links which are JS Arrays containing Patch, Turtle and Link JS Objects that are the Model's data. They are initialized by the Model constructor.

A user's Model is a subclass of Model. It contains two functions: setup() which creates the initial instances of Patches, Turtles and Links, and step() which modifies these over time.

## MVC

---

### Model

Models create a World containing Patches, Turtles and Links. The World is a euclidean geometry, World.js, with 6 min/max X,Y,Z values defaulting to:

                  maxX = 16
                  minX = -16
                  maxY = 16
                  minY = -16
                  maxZ = 16
                  minZ = -16

These define a cube, or bounds, that the Model is constrained to.

Patches are an Array forming a grid of JS Objects, Patches.js, on the World which contain values used by the Model such as elevation for a hill or pheromone for ants.

Turtles are JS Objects, Turtles.js, moving on top of the Patches such as rain drops on the hill or the ants following the pheromone.

Links are JS Objects, Links.js, which are lines with two turtles as endpoints. They can provide a grid for Turtles to move on or a network for a Traveling Sales Person problem.

The Patches and Turtles have x, y and z values, constrained to the World's bounds, letting them work in 3D even though most models are 2D with Patches and Turtles having a z value of 0.

### View

Views are used to see the Model properties as they evolve. There can be many Views. We provide the TwoDraw.js class which creates a [2D Canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) view and the ThreeDraw.js class which creates the [Three.js](https://threejs.org/) 2.5D and 3D views. These are spatial views.

We also provide the Plot.js view for traditional data plot views.

### Control

Controls provide UI elements to start, stop, modify the Model, useful for exploring it under different settings.

GUI.js provides a drop down menu set of controls. Keyboard.js controls the Model using key presses. Mouse.js lets the modeler move Turtles directly. Buttons.js provides simple browser buttons under the View.

### Running Models

Models have a constructor which takes the World values the model wants, defaulted as shown above. It then uses them to create the Patches.

The Model class has two functions:

setup() creates the initial sets of Turtles and Links along with the parameters they and the Patches contain.

step() updates the parameters of the Patches, Turtles and Links. This creates the dynamics of the model.

An Animator.js class is provided to automate the calling of the step function. It also updates the View if there is one.

Note that Models themselves have no colors, shapes, sizes etc for viewing the model. Models are containers of data that evolve using the step function.

## AS Repository

---

AS uses git and github for it's repo. There is quite a lot more than just the core AS MVC files. It includes well over 150 demos, an IDE, and GIS (Leaflet & Maplibre) integrations.

### src/

The src/ folder contains all the JS files needed for our MVC. The most used is the Model.js class which imports the Patches, Turtles and Links classes as well as the World class:

    import World from './World.js'
    import GeoWorld from './GeoWorld.js'
    import Patches from './Patches.js'
    import Patch from './Patch.js'
    import Turtles from './Turtles.js'
    import Turtle from './Turtle.js'
    import Links from './Links.js'
    import Link from './Link.js'

The modeler does not import these, instead the Model.js imports them for the modeler in it's constructor.

There is also the Model3D.js subclass of Model.js which adds the [three.js](https://threejs.org/) 3D library to the Model.

AgentArray.js is a subclass of the JS Array class, adding NetLogo semantics to the Arrays used by Patches.js, Turtles.js and Links.js classes

Animator.js mentioned above lives in src/ as do all the control classes: Buttons.js, GUI.js, Keyboard.js, Mouse.js and the view classes: TwoDraw.js, ThreeDraw.js, Three.js and Plot.js

There also is AS.js used to create a rollup of all of the src/ folder. It is publically available from unpkg.com which makes it available from all the rest of the major CDN's.

And all our small utility functions are in the util.js file. These are primarily used by the MVC classes but can be used by the modeler as well.

### models/

We provide several (currently 31) basic Models in models/. They all have the same structure: a constructor that initializes the World and provides a setup() and step() function.

Here is models/TemplateModel.js, designed to be a good introduction to creating a Model. It is meant to be cloned and edited for creating new models.

```js
import World from 'https://agentscript.org/src/World.js'
import Model from 'https://agentscript.org/src/Model.js'
import * as util from 'https://agentscript.org/src/utils.js'

export default class TemplateModel extends Model {
    population = 10 // number of turtles
    speed = 0.25 // step size in patch units
    wiggleAngle = 30 // wiggle angle in degrees

    // worldOptions: patches -16, 16 or 33 x 33 with 0,0 origin
    constructor(worldOptions = World.defaultOptions(16)) {
        super(worldOptions)
    }

    setup() {
        // Have turtles "bounce" at the Patches edges.
        // Default is to wrap
        this.turtles.setDefault('atEdge', 'bounce')

        // create "population" turtles initially on the origin
        this.turtles.create(this.population, t => {
            t.setxy(0, 0)
        })
        // have each turtle create a link to an other turtle
        this.turtles.ask(t => {
            this.links.create(t, this.turtles.otherOneOf(t))
        })
    }

    step() {
        // change heading randomly, moving forward by "speed"
        this.turtles.ask(t => {
            t.heading += util.randomCentered(this.wiggleAngle)
            t.forward(this.speed)
        })
    }
}
```

### bin/

This contains several bash scripts managing the repo, but not used by modelers.

### views1, views2, views25, views3

These folders contain HTML files for wrapping Models in the models/ folder. This makes it very easy for modeler to see their Models being run:

views1: Run just the models and print the result. It does not have a View other than printing to the browser. This may seem odd, but illustrates the separation within the MVC architecture. It also lets Models be used by scripts outside of AS.

views2: Run the models with the TwoDraw.js 2D view. This is the simplest and most common usage.

views25: Run the models as in views2, but with the ThreeDraw.js 3D view, resulting in a "2.5" view.

views3: Run the 3D models in the ThreeDraw.js 3D view. This allows the Turtles to be 3D objects as well as running in a 3D world.

#### views1

Here is the views1 style. These are all created by a script in bin/ above. This lets us test all models before any git commit.

The modeler can clone one of these, importing their model from a local file, and getting utils.js from 'https://agentscript.org/src/utils.js'

```js
html>
<head>
    <title>Buttons</title>
</head>
<body>
    <script type="module">
        import * as util from '/src/utils.js'
        import Model from '/models/ButtonsModel.js'

        const model = new Model()
        model.setup()
        util.repeat(500, model.step)

        const sample = util.sampleModel(model)
        util.printToPage(sample)
    </script>
</body>
</html>
```

Produces lots of data randomly copied by util.sampleModel:

```
Running for 500 steps.
{
  "ticks": 500,
  "model": [
    "world",
    "patches",
    "turtles",
    "links",
...
    "population",
    "speed",
    "wiggleAngle"
  ],
  "patches": 1089,
  "patch": {
    "id": 563
  },
...
}
```

#### views2

Here is a views2 example:

```js
<html>
    <head>
        <title>Template</title>
    </head>

    <body>
        <script type="module">
            import Animator from 'https://agentscript.org/src/Animator.js'
            import TwoDraw from 'https://agentscript.org/src/TwoDraw.js'
            import Model from 'https://agentscript.org/models/TemplateModel.js'

            const model = new Model()
            model.setup()

            const view = new TwoDraw(model, {
                div: 'modelDiv',
                patchSize: 20,
                drawOptions: {
                    turtlesColor: 'yellow',
                    turtlesSize: 3,
                    turtlesShape: 'bug',
                    linksColor: 'red',
                    linksWidth: 3,
                    // try patchesMap: 'Jet' for bright patch colors!
                },
            })

            const anim = new Animator(
                () => {
                    model.step()
                    view.draw()
                },
                500, // run for 500 steps
                30 // at 30 steps/second
            )
        </script>
        <div id="modelDiv"></div>
    </body>
</html>

```

This is considerably more complex than the views1 example:

**imports:** We import Animator, TwoDraw, and the TemplateModel from 'https://agentscript.org/'.

**new Model:** The model is initialized as in views1.

**div:** An HTML `<div id="modelDiv"></div>` is used to show the View in the browser.

**TwoDraw:** The TwoDraw View is created, giving it parameters such as the div, the patch size in pixels, and options used for the View's Turtles, Patches and Links. Here are the basic drawOptions and their default values:

```js
    patchesColor: 'random',
    initPatches: null,

    turtlesColor: 'random',
    turtlesShape: 'dart',
    turtlesSize: 1,
    turtlesRotate: true,

    linksColor: 'random',
    linksWidth: 1,

    textProperty: null,
    textSize: 0.5,
    textColor: 'black',

    patchesMap: 'DarkGray',
    turtlesMap: 'Basic16',
```

The values can be functions returning a value, based on their use within the model. Here are a few examples, see the views2 html files for more.

```js
patchesColor: p => (p.living ? 'red' : 'black') // game of life patches
turtlesColor: t => (t.carryingFood ? nestColor : foodColor) // ants
turtlesRotate: t => !['lion', 'smiley', 'tree'].includes(turtleName(t)) // shapes
```

If an initPatches function is given, it provides a color for each patch and is unchanged from then on.

patchesMap and turtlesMap are src/ColorMap.js arrays of src/Color.js colors. Setting patchesMap: 'Jet' for example gives patches bright colors if patchesColor is set to 'random'.

If textProperty is a turtle property, then the turtles show that value. See views2 gridpath.html and hellotext.html for their use.

**Animator:** We use the Animator to run the model for 500 steps at 30 FPS. We not only ask the model to step(), but also ask the view to draw() using the modified model's data.

The view looks like this:
![Views2 Model](/models/data/template.jpg)

The modeler can clone this and import their model from a local file. To get running quickly, use vscode there and use the Go Live button which starts a browser with all the items in the local file.

### test/ & tests/

These are git-ignored folders used to test the repo before committing or to play with tests but not committing them. They are not used by modelers.

## API Reference

---

### Turtle properties and methods

Properties set on a Turtle instance:

```js
t.x, t.y, t.z      // position (floats)
t.heading           // direction in degrees (getter/setter)
t.id                // unique integer id
t.hidden            // boolean, default false
t.atEdge            // 'wrap' (default), 'bounce', 'clamp', 'die', 'random', or a function
t.patch             // the Patch this turtle is on (getter)
t.links             // AgentArray of this turtle's Links (getter)
```

Movement:

```js
t.forward(d)                        // move d units along heading
t.setxy(x, y, z?)                   // set position
t.moveTo(agent)                     // move to a Patch or Turtle location
t.rotate(angle)                     // rotate heading by angle
t.right(angle) / t.left(angle)      // turn right or left
t.face(agent)                       // set heading toward agent
t.facexy(x, y)                      // set heading toward x,y
```

Sensing:

```js
t.distance(agent)                   // distance to Patch or Turtle
t.distanceXY(x, y)                  // distance to x,y
t.towards(agent)                    // heading toward agent
t.towardsXY(x, y)                   // heading toward x,y
t.patchAt(dx, dy)                   // patch at relative offset (undefined if off-world)
t.patchAhead(dist)                  // patch ahead by dist (undefined if off-world)
t.patchRightAndAhead(angle, dist)   // patch right and ahead
t.patchLeftAndAhead(angle, dist)    // patch left and ahead
t.canMove(dist)                     // true if moving forward dist stays on-world
```

Lifecycle and links:

```js
t.die()                             // remove this turtle (also removes its links)
t.hatch(num, breed?, init?)         // create num turtles at my location
t.otherEnd(link)                    // the other turtle in a link
t.linkNeighbors()                   // array of all turtles linked to me
```

### Patch properties and methods

```js
p.x, p.y            // integer coordinates
p.id                // index
p.neighbors         // 8 Moore neighbors (cached getter)
p.neighbors4        // 4 Von Neumann neighbors N/S/E/W (cached getter)
p.turtlesHere       // AgentArray of turtles on this patch (getter)
p.isOnEdge()        // true if edge patch
p.distance(agent)   // distance to agent
p.patchAt(dx, dy)   // patch at integer offset (undefined if off-world)
p.sprout(num, breed?, init?)  // create turtles at this patch
```

### Collection methods (Patches, Turtles, Links)

`this.patches`, `this.turtles`, `this.links`, and all query results are **JS Array subclasses** (AgentArray). All standard JS Array methods work: `forEach`, `map`, `filter`, `find`, `some`, `every`, `reduce`, indexing, `length`, etc.

AgentArray adds these NetLogo-style methods:

**Iteration:**
```js
.ask(fcn)               // call fcn(agent) for each agent; safe if agents die during iteration
.forLoop(fcn)           // faster iteration when array won't change
.with(fcn)              // return new AgentArray where fcn(agent) is true (alias for filter)
.other(agent)           // return all agents except agent
```

**Random selection:**
```js
.oneOf()                // return a random agent
.otherOneOf(agent)      // return a random agent other than agent
.nOf(n)                 // return n random agents
.otherNOf(n, agent)     // return n random agents other than agent
```

**Min/max:**
```js
.minOneOf(fcn)          // agent with minimum fcn(agent) value
.maxOneOf(fcn)          // agent with maximum fcn(agent) value
.minValOf(fcn)          // [agent, value] pair with minimum — use when you need both
.maxValOf(fcn)          // [agent, value] pair with maximum — use when you need both
.minNOf(n, fcn)         // n agents with lowest fcn values
.maxNOf(n, fcn)         // n agents with highest fcn values
```

**Statistics on a numeric property:**
```js
.sum(key)               // sum of agent[key]
.avg(key)               // average of agent[key]
.min(key)               // minimum of agent[key]
.max(key)               // maximum of agent[key]
.extent(key)            // [min, max] of agent[key]
.count(fcn)             // count of agents where fcn(agent) is true
```

**Utilities:**
```js
.props(name)            // return AgentArray of agent[name] values
.sortBy(reporter)       // sort in place by property name or function
.shuffle()              // shuffle in place
.clone()                // return a shallow copy
.isEmpty()              // true if length === 0
.first() / .last()      // first or last agent
.all(fcn)               // true if fcn(agent) is true for all (alias for every)
```

**AgentSet only** (on `this.patches`, `this.turtles`, `this.links`):
```js
.setDefault(name, val)  // set a shared default property for all agents
.newBreed(name)         // create a named breed sub-array
.clear()                // kill all agents
```

Spatial queries on **Patches**:

```js
this.patches.patch(x, y)                    // patch at float x,y (rounds to nearest)
this.patches.inRadius(patch, radius)        // patches within radius of patch
this.patches.inRect(patch, dx, dy?)         // patches in a rectangle
this.patches.diffuse(property, rate)        // diffuse patch property to 8 neighbors
this.patches.diffuse4(property, rate)       // diffuse to 4 neighbors
this.patches.edgePatches()                  // all edge patches
```

Spatial queries on **Turtles**:

```js
this.turtles.inRadius(turtle, radius)       // turtles within radius
this.turtles.inCone(turtle, radius, angle)  // turtles within cone ahead of turtle
this.turtles.closestTurtle(x, y, radius)    // nearest turtle within radius of x,y
this.turtles.layoutCircle(radius?, center?) // arrange turtles in a circle
```

**Links** creation:

```js
this.links.create(from, to, init?)          // create link(s); to can be one turtle or array
```

### Available turtle shapes

```
arrow  bug  bug2  circle  dart (default)  frame  frame2
person  person2  pentagon  butterfly  ring  ring2  square  triangle
```

Shapes ending in `2` (bug2, frame2, person2, ring2) use both `turtlesColor` and `turtlesStrokeColor`.

### Available ColorMap names

For use as `patchesMap` or `turtlesMap` in drawOptions:

```
Gray  LightGray  DarkGray  Hue  Jet  Rgb  Rgb256  Basic16  Transparent
```

## VSCode & Claude Code

---

[Claude Code](https://code.claude.com/docs/en/overview) can be used in the AS Repo using this CLAUDE.md file. It will use both the Terminal and VS Code extension. The CLAUDE.md file can also can be used for Claude, ChatGPT, and other AI chats as a way to expose AS to them.
