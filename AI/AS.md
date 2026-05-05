# AgentScript (AS) — Model Creation Reference

Use this document to write new AgentScript models and their views.
Do not rely on any prior knowledge of AgentScript — use only what is described here.

---

## Imports

All AS modules are available from `https://agentscript.org/`:

```js
import World from 'https://agentscript.org/src/World.js'
import Model from 'https://agentscript.org/src/Model.js'
import * as util from 'https://agentscript.org/src/utils.js'
```

For views:

```js
import Animator from 'https://agentscript.org/src/Animator.js'
import TwoDraw from 'https://agentscript.org/src/TwoDraw.js'
```

---

## Model Class Structure

A model is an ES module that default-exports a class extending `Model`:

```js
export default class MyModel extends Model {
    // Parameters — declare with defaults
    population = 100
    someRate = 0.5

    constructor(worldOptions = World.defaultOptions(16)) {
        super(worldOptions)
    }

    setup() {
        // Create initial state: turtles, patch properties, links
    }

    step() {
        // Update state each tick
        // Set this.done = true to signal completion
    }
}
```

`this.ticks` increments automatically each step. `this.done` is `false` by default; set it to `true` to stop.

---

## World Options

`World.defaultOptions(maxCoord)` creates a symmetric world from `-maxCoord` to `+maxCoord` on X and Y.

```js
World.defaultOptions(16) // 33×33 patches, coordinates -16..16
World.defaultOptions(25) // 51×51 patches
World.defaultOptions(50) // 101×101 patches
```

Custom options:

```js
{ minX: -20, maxX: 20, minY: -10, maxY: 10 }
```

---

## Patches

`this.patches` is an AgentArray of all Patch objects, forming a fixed grid.

```js
// Iterate
this.patches.ask(p => {
    p.myProp = 0
})

// Filter
const onFire = this.patches.with(p => p.burning)

// Get patch at coordinates (rounds to nearest)
const p = this.patches.patch(x, y)

// Neighbors
p.neighbors // 8 Moore neighbors (AgentArray)
p.neighbors4 // 4 Von Neumann neighbors N/S/E/W

// Turtles on this patch
p.turtlesHere // AgentArray of turtles currently on p

// Find occupied neighbor patches
const occupied = p.neighbors.with(n => n.turtlesHere.length > 0)

// Find empty patches across the whole world
const empty = this.patches.with(p => p.turtlesHere.length === 0)

// Move a turtle to a random empty patch
t.moveTo(empty.oneOf())

// Position
;(p.x, p.y) // integer coordinates

// Check edge
p.isOnEdge()

// Diffuse a numeric property to neighbors
this.patches.diffuse('myProp', 0.1) // 8 neighbors
this.patches.diffuse4('myProp', 0.1) // 4 neighbors

// Create turtles at a patch
p.sprout(3, this.turtles, t => {
    t.color = 'red'
})
```

Patch breeds (named subsets of patches):

```js
this.patchBreeds('fires embers') // creates this.fires, this.embers
p.setBreed(this.fires) // move p into the fires breed
```

---

## Turtles

`this.turtles` is an AgentArray of all Turtle objects. Turtles move on top of patches.

```js
// Create turtles
this.turtles.create(100, t => {
    t.setxy(0, 0)        // place at coordinates
    t.color = 'red'      // custom property (set via setDefault or per-turtle)
})

// Iteration
this.turtles.ask(t => { t.forward(0.5) })

// Properties
t.x, t.y, t.z       // position (floats)
t.heading           // direction in degrees (0 = north, clockwise)
t.id                // unique integer
t.hidden            // boolean
t.patch             // the Patch this turtle is on (getter)
t.links             // AgentArray of this turtle's Links

// Movement
t.forward(dist)             // move dist units along heading
t.setxy(x, y)               // teleport to x, y
t.moveTo(patchOrTurtle)     // move to a patch or turtle's location
t.face(agent)               // point heading toward agent
t.right(angle)              // turn right by degrees
t.left(angle)               // turn left by degrees

// Sensing
t.distance(agent)           // Euclidean distance to patch or turtle
t.patchAhead(dist)          // patch in front (undefined if off-world)
t.patchAt(dx, dy)           // patch at relative offset

// Edge behavior (set before moving)
t.atEdge = 'wrap'     // default: wraps around world
t.atEdge = 'bounce'   // bounces off edges
t.atEdge = 'die'      // turtle dies at edge

// Or set a default for all turtles
this.turtles.setDefault('atEdge', 'bounce')

// Lifecycle
t.die()                         // remove turtle (also removes its links)
t.hatch(n, breed?, init?)       // create n turtles at same location
```

Turtle breeds (named subsets of turtles):

```js
this.turtleBreeds('wolves sheep') // creates this.wolves, this.sheep
t.setBreed(this.wolves) // move t into wolves breed

// Create directly into a breed
this.wolves.create(10, t => {
    t.setxy(0, 0)
})
```

---

## Links

`this.links` is an AgentArray of all Link objects. A link connects two turtles.

```js
this.links.create(turtleA, turtleB) // create one link
this.links.create(turtleA, arrayOfTurtles) // create many links from one turtle

// Link properties
;(link.end1, link.end2) // the two turtles
link.length // Euclidean distance between endpoints
```

---

## AgentArray Methods

`this.patches`, `this.turtles`, `this.links`, and all query results are AgentArrays — JS Array subclasses with these extras:

**Iteration:**

```js
.ask(fn)         // fn(agent) for each — safe if agents die during iteration
.forLoop(fn)     // faster iteration when array won't change
```

**Filtering:**

```js
.with(fn)        // returns new AgentArray where fn(agent) is true  (alias: .filter)
.other(agent)    // all agents except this one
```

**Random selection:**

```js
.oneOf()              // one random agent
.otherOneOf(agent)    // one random agent, not agent
.nOf(n)               // n random agents
```

**Aggregation:**

```js
.sum(key)         // sum of agent[key]
.avg(key)         // average of agent[key]
.min(key)         // min of agent[key]
.max(key)         // max of agent[key]
.count(fn)        // count of agents where fn(agent) is true
```

**Other:**

```js
.isEmpty()        // true if length === 0
.first()          // first agent
.shuffle()        // return a shuffled copy (original unchanged)
.shuffleInPlace() // shuffle in place, return this
.sortBy(fn)       // sort in place
.props(name)      // AgentArray of agent[name] values
```

**AgentSet only** (on `this.patches`, `this.turtles`, `this.links` — not query results):

```js
.setDefault(name, val)   // shared default for all agents of this type
.clear()                 // remove all agents
```

---

## util.js

```js
util.randomInt(n) // integer in [0, n)
util.randomInt2(min, max) // integer in [min, max]
util.randomFloat(n) // float in [0, n)
util.randomFloat2(min, max) // float in [min, max]
util.randomCentered(n) // float in [-n/2, n/2]
util.repeat(n, fn) // call fn(i) n times
util.clamp(val, min, max) // clamp value to range
util.lerp(lo, hi, t) // linear interpolation
util.mod(val, modulus) // always-positive modulo
```

---

## views2 HTML

The standard HTML wrapper for running a model with a 2D canvas view:

```html
<html>
    <head>
        <title>MyModel</title>
    </head>
    <body>
        <script type="module">
            import Animator from 'https://agentscript.org/src/Animator.js'
            import TwoDraw from 'https://agentscript.org/src/TwoDraw.js'
            import Model from '/models/MyModel.js' // local path, or full URL

            const model = new Model()
            model.setup()

            const view = new TwoDraw(model, {
                div: 'modelDiv',
                patchSize: 10, // pixels per patch
                drawOptions: {
                    patchesColor: p => (p.isForest ? 'green' : 'tan'),
                    turtlesColor: t => (t.type === 'wolf' ? 'gray' : 'white'),
                    turtlesShape: 'dart',
                    turtlesSize: 1,
                    linksColor: 'rgba(255,255,255,0.3)',
                    linksWidth: 1,
                },
            })

            const anim = new Animator(
                () => {
                    model.step()
                    view.draw()
                    if (model.done) anim.stop()
                },
                -1, // run until done (or use a step count like 500)
                30 // frames per second
            )
        </script>
        <div id="modelDiv"></div>
```

**Animator methods:**

```js
anim.start()                    // start running
anim.stop()                     // stop running; returns anim (chainable: new Animator(...).stop())
anim.toggle()                   // stop if running, start if stopped
anim.once()                     // advance one step (stops first if running)
anim.isRunning()                // boolean
anim.setFps(fps)                // change frames per second while running
anim.restart(model, view)       // reset model (clear turtles, ticks=0, done=false, re-run setup()) then restart
```

**Restarting:** `anim.restart(model, view)` resets the model in place — the view continues to reference the same model object, so no new TwoDraw is needed.

If you need to reinitialize without an Animator (e.g. a plain Setup button before Go is ever clicked), create a new Model and a new TwoDraw:

```js
function setup() {
    if (anim) anim.stop()
    model = new Model()
    model.setup()
    view = new TwoDraw(model, { div: 'modelDiv', patchSize: 10, drawOptions: { ... } })
    view.draw()
}
```

### drawOptions defaults and values

```js
patchesColor: 'random' // or a function p => color
turtlesColor: 'random' // or a function t => color
turtlesShape: 'dart' // see shapes list below
turtlesSize: 1 // in patch units
turtlesRotate: true // rotate shape to match heading
linksColor: 'random' // or a function l => color
linksWidth: 1 // pixels
patchesMap: 'DarkGray' // ColorMap name for random patch colors
turtlesMap: 'Basic16' // ColorMap name for random turtle colors
```

Color values can be any CSS color string: `'red'`, `'#ff0000'`, `'rgb(255,0,0)'`, `'rgba(255,0,0,0.5)'`.

### Turtle shapes

```
arrow  bug  bug2  circle  dart  frame  frame2
person  person2  pentagon  butterfly  ring  ring2  square  triangle
```

### ColorMap names (for patchesMap / turtlesMap)

```
Gray  LightGray  DarkGray  Hue  Jet  Rgb  Basic16  Transparent
```

---

## GUIDiv — Controls

`GUIDiv` provides interactive controls (sliders, buttons, monitors, etc.) rendered as HTML inside a div. Import it alongside Animator and TwoDraw:

```js
import GUIDiv from 'https://agentscript.org/src/GUIDiv.js'
```

### HTML

The body only needs bare divs — no CSS required:

```html
<div id="controlsDiv"></div>
<div id="modelDiv"></div>
```

### Constructor

```js
new GUIDiv(template, { divId = 'controlsDiv', layout = 'row', title = null } = {})
```

- **divId** — id of the div to populate (default `'controlsDiv'`)
- **layout** — `'row'` (horizontal, wrapping) or `'column'` (vertical)
- **title** — optional string; displays a bold centered title and sets up page centering

### Template

A plain object where each key is the control label and the value describes the control type:

```js
new GUIDiv({
    fps: {
        slider: [30, [5, 60, 5]],        // [default, [min, max, step]]
        cmd: val => anim.setFps(val),
    },
    shape: {
        chooser: ['dart', ['dart', 'bug', 'circle']], // [default, [options]]
        cmd: val => (view.drawOptions.turtlesShape = val),
    },
    color: {
        color: '#ff0000',
        cmd: val => (view.drawOptions.turtlesColor = val),
    },
    paused: {
        switch: false,                   // boolean default
        cmd: val => val ? anim.stop() : anim.start(),
    },
    label: {
        input: 'hello',                  // string default
        cmd: val => (document.title = val),
    },
    reset: {
        button: () => anim.restart(model, view),  // val is the click handler
    },
    ticks: {
        monitor: [model, 'ticks'],       // live display of model.ticks
    },
}, { title: 'My Model' })
```

**Notes:**
- `slider` and `chooser` values are `[default, extent]`; all others are just the default value
- `button` val is the click handler directly — no `cmd` key needed
- `switch` is not called on init (only on user interaction)
- `monitor` polls the property each animation frame automatically

### Row breaks

Any key starting with `'---'` inserts a line break between rows:

```js
{
    density: { slider: [70, [1, 99, 1]], cmd: val => model.density = val },
    '---': {},
    restart: { button: () => anim.restart(model, view) },
}
```

### Multiple control panels

Use different `divId`s and add matching divs to the HTML:

```html
<div id="topControls"></div>
<div id="modelDiv"></div>
<div id="bottomControls"></div>
```

```js
new GUIDiv(template1, { title: 'My Model', divId: 'topControls' })
new GUIDiv(template2, { divId: 'bottomControls' })
```
