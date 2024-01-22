The mouse control has a very simple api:

```javascript
const mouse = new Mouse(model, view, callback)
```

where callback is a function that is called each event of the mouse.
The callback should manage three events: `mousedown, mousedrag, mouseup`.

Here is a common mouse usage: grab the nearest turtle and move it while the
mouse is dragged, and stops when the moused button is let up.

It works by having a variable, `selectedTurtle` that is calculated each mousedown.
It moves the selectedTurtle during mousedrag. It quits on mouseup.

```javascript
let selectedTurtle
const mouse = new Mouse(model, view, mouse => {
    const { x, y, action } = mouse
    switch (action) {
        case 'mousedown':
            // anim.stop()
            selectedTurtle = model.turtles.minOneOf(t => t.distanceXY(x, y))
            break
        case 'mousedrag':
            if (selectedTurtle) selectedTurtle.setxy(x, y)
            break
        case 'mouseup':
            // anim.start()
            selectedTurtle = null
            break
    }
}).start()
```

[This model](https://code.agentscript.org/mvc/gui.html) shows the Mouse control usage.

The comcmented out
