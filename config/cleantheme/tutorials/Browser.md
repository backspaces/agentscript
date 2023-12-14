AgentScript runs in the browser. This means the models you create will be imbedded within an html file.

### HTML Files

An HTML file for AgentScrit models looks like these:

```html
<html>
    <head>
        <title>Hello</title>
    </head>

    <body>
        <script type="module">
            // Your JavaScript model goes here
        </script>

        <!-- You need a html <div> for the model to run in. -->
        <div id="modelDiv"></div>
    </body>
</html>
```

Your JavaScript code goes in the script area. You also need a simple area, the div above, in which we display the running model. We'll build some of these later.

### Browser's Developer Console

The browsers all support a Developer Console which lets you manage your model by setting break points to see the state of the model at a given place in your code. It also provides a handy `console.log()` function.

Here's an article on finding your browser's [Developer's Console](https://balsamiq.com/support/faqs/browserconsole/).

In Chrome and Safari (after enabling the feature), "Option" + "Control" + "J" opens the Developer's console. Use the link above to find how to access all the browsers console.

To get started, go to our [pheromone.html page](https://code.agentscript.org/views2/pheromone.html). Then open the Developer Console as above.

Chrome's looks like this:

![Image](/config/cleantheme/static/DevConsole.jpg)

In the row of choices, click on "Console". You'll get the view shown above.

<!-- This is a bit like our [view-source capability](https://www.computerhope.com/issues/ch000746.htm).
Both are very useful in exploring and debugging.

In Chrome and Safari (after enabling the feature), "Option" + "Control" + "J" opens the Developer's console. -->

### Browser's view-source Capability

In addition to the browser's Developer Console, the Browser has a way to look at a pages HTML.

Like opening the Developer's Console with "Option" + "Control" + "J" in Chrome, using "Option" + "Control" + "U" will open a new tab showing the current page's HTML.

The view-source details are [detailed here:](https://www.computerhope.com/issues/ch000746.htm) in case your browser uses a different scheme.

You can see this in action with our PheronomeModel above. and see the code via "Option" + "Control" + "U" or equivalent. You'll see:

![Image](/config/cleantheme/static/ViewSource.jpg)

<!-- We'll be using the browser's [Developer's Console](https://balsamiq.com/support/faqs/browserconsole/).
This is a bit like our [view-source capability](https://www.computerhope.com/issues/ch000746.htm).
Both are very useful in exploring and debugging. -->

<!-- In Chrome and Safari (after enabling the feature), "Option" + "Control" + "J" opens the Developer's console. -->

<!-- To get started, go to our [pheromone.html page](https://code.agentscript.org/views2/pheromone.html).
Then open the Developer Console as above. -->

<!-- Chrome's looks like this:

![Image](/config/cleantheme/static/DevConsole.jpg)

In the row of choices, click on "Console". You'll get the view shown above -->
