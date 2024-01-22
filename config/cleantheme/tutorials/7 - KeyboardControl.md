<!-- # AnimatorControl -->

One of the simplest controls is the KeyboardControl. It also is easy to setup.
We'll use the pheromone example, adding keyboard controls

### Keyboard

The input to the Keyboard control is an array of objects, each with a key and cmd value. It looks like:

```javascript
const keyCommands = [
    { key: 't', cmd: () => anim.toggle() },
    { key: 'o', cmd: () => anim.once() },
    { key: 'd', cmd: () => view.downloadCanvas() },
]
const keyboard = new Keyboard(keyCommands)
keyboard.start()
```

In this case, we have three keyboard actions:

The `t key` will toggle the animator .. i.e. if stopped, it'll start, otherwise it'll stop.

The `o key` will call the animator "once" function.

The `d key` will download the view's image.

### Modifiers

We also support modifiers like: `AltKey, ctrlKey, metaKey, shiftKey` so that "Alt-o", the Alt key down and the o key pressed, is the trigger for `anim.once()` above.

You specify the Alt modifier in one of two ways:

-   Specify the modifier in the keyCommand:
-   Specify the key as the default modifier in the constructor:

```javascript
// In the key command:
{ modifier: 'altKey', key: 'o', cmd: () => anim.once() }

// or as the default for all commands:
const keyboard = new Keyboard(keyCommands, 'altKey')
```

Note that if you specify the default as `altKey`, you can still have individual keyCommands use a different modifier, or no modiffier.

```javascript
// Override the default:
{ modifier: 'shiftKey', key: 'o', cmd: () => anim.once() },

// Or have no modifier
{ modifier: 'None', key: 'o', cmd: () => anim.once() },
```

Here are several more examples:

```javascript
const keyCommands = [
    // These use the default modifier key, in this case the 'alt' key
    { key: 'q', cmd: () => console.log('q') },
    { key: '2', cmd: () => console.log('2') },
    { key: 'F2', cmd: () => console.log('F2') },
    { key: 'ArrowDown', cmd: () => console.log('ArrowDown') },
    { key: 'Escape', cmd: () => console.log('Escape') },
    // Here we override the default modifier key
    { modifier: 'shiftKey', key: 'a', cmd: () => console.log('shift A') },
    { modifier: 'None', key: 'b', cmd: () => console.log('b') },
    { modifier: '', key: 'c', cmd: () => console.log('c') },
]
const keyboard = new Keyboard(keyCommands, 'altKey')
```

Finally, there are two methods to start/stop the keyboard.

-   keyboard.start()
-   keyboard.stop()
