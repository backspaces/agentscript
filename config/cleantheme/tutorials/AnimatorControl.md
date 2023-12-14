<!-- # AnimatorControl -->

Controls are functions that let you manage your Model and View .. the "C" in "MVC".

We've already used one in the [View tutorial](/config/cleantheme/tutorials/View#twodraw-html). It's the Animator near the bottom.

![Image](/config/cleantheme/static/ViewFragment.jpg)

To explore the Animator control, we'll use the browser's Developer Console

<!-- ### Browser's Developer Console

We'll be using the browser's [Developer's Console](https://balsamiq.com/support/faqs/browserconsole/).
This is a bit like our [view-source capability](https://www.computerhope.com/issues/ch000746.htm).
Both are very useful in exploring and debugging.

In Chrome and Safari (after enabling the feature), "Option" + "Control" + "J" opens the Developer's console.

To get started, go to our [pheromone.html page](https://code.agentscript.org/views2/pheromone.html).
Then open the Developer Console as above.

Chrome's looks like this:

![Image](/config/cleantheme/static/DevConsole.jpg)

In the row of choices, click on "Console". You'll get the view shown above -->

### Animator

The Animator looks like this:

```javascript
const anim = new Animator(
    () => {
        model.step()
        view.draw()
    },
    500, // run 500 steps
    30 // 30 fps
)
```

It controls both the model and view as you can see. In this case it is set up to
run 500 steps, at 30 fps.

The last line in the the View's HTML section has this:

```javascript
util.toWindow({ util, model, view, anim })
```

It puts these 4 properties in the global window object.
The anim object is the one we'll be working with.

Making sure you're still on [pheromone.html page](https://code.agentscript.org/views2/pheromone.html). It probably has completed it's 500 steps. You can check by typing "anim.isRunning()"

Lets restart it. Start by typing "anim" and hit return. It should show:

`> Animator {steps: 500, fps: 30, timeoutID: null, ticks: 500, fcn: ƒ}`

To restart it, first type in `anim.reset(-1, 20)`

The two parameters are how many steps to take before stoppine and at what fps (frames per second) to run.

Using -1 steps means `foreveer`, and at 20 fps.

Then `anim.start()` to restart with the new parameters.

![Image](/config/cleantheme/static/RestartAnim.jpg)

A few more functions:

`anim.startStats()` // puts a fps widget on screen

![Image](/config/cleantheme/static/ShowStats.jpg)

`anim.toggle()` // if running, stop(). Otherwise start()

`anim.once()` // If running, stop(). Run animator once. Use start() to restart.

<!-- [Foo](/config/cleantheme/tutorials//View)

[Bar](https://code.agentscript.org/config/cleantheme/tutorials/View)

[baz](/config/cleantheme/tutorials/View#twodraw-html)

[zot](https://code.agentscript.org/config/cleantheme/tutorials//Model) -->
