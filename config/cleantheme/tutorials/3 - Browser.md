AgentScript runs in the browser. This means the models you create will be contained within an HTML file.

## HTML Files

An HTML file for AgentScript models looks like these:

```html
<html>
    <head>
        <title>Hello</title>
    </head>

    <body>
        <script type="module">
            // Your JavaScript model goes here
        </script>

        <!-- You create an HTML <div> for the model to run in. -->
        <div id="modelDiv"></div>
    </body>
</html>
```

Your JavaScript code goes in the script area. You also need a simple area, the div above, in which we display the running model. We'll build some of these later. (Note the two different comment types: // for JavaScript and \<!-- .. --> for HTML)

## Browser's Developer Console

The browsers all support a Developer Console which lets you step through your model to see the state of the model at a given place in your code. It also provides a handy `console.log()` function to print values within your code.

Here's an article on finding your browser's [Developer's Console](https://balsamiq.com/support/faqs/browserconsole/).

In Chrome and Safari (after enabling the feature), "Option" + "Control" + "J" opens the Developer's console. Use the link above to find how to access all the browsers consoles.

<!-- o get started, go to our [pheromone.html page](https://code.agentscript.org/views2/pheromone.html) Then open the Developer Console as above. -->

To get started, go to our <a href="https://code.agentscript.org/views2/pheromone.html" target="_blank"> pheromone.html page</a>. Then open the Developer Console as above.

Chrome's looks like this:

![Image](/config/cleantheme/static/DevConsole.jpg)

In the row of choices, click on "Console" if not already highlighted. You'll get the view shown above. The text "toWindow ..." is used by the model to make these variables available for debugging. Type "model" at the prompt to see the model's state.

<!-- This is a bit like our [view-source capability](https://www.computerhope.com/issues/ch000746.htm).
Both are very useful in exploring and debugging.

In Chrome and Safari (after enabling the feature), "Option" + "Control" + "J" opens the Developer's console. -->

## Browser's view-source Capability

In addition to the browser's Developer Console, the Browser has a way to look at a page's HTML.

Like opening the Developer's Console with "Option" + "Control" + "J" in Chrome, using "Option" + "Control" + "U" will open a new tab showing the current page's HTML.

The view-source details are [detailed here:](https://www.computerhope.com/issues/ch000746.htm) in case your browser uses a different scheme.

You can see this in action with our PheronomeModel above, and see the code via "Option" + "Control" + "U" or equivalent. You'll see:

![Image](/config/cleantheme/static/ViewSource.jpg)

Don't be concerned about all the new concepts! Here are the main ideas:

-   The import's bring modules into our program, including the PheromoneModel itslef.
-   The colorMap is used to color the Model's patches (background squares)
-   The Model is our [PheromoneModel](https://code.agentscript.org/models/PheromoneModel.js), the parts of which are discussed in our [Snippets](https://code.agentscript.org/config/cleantheme/Snippets.html) demo.
-   A new instance of the Model is created using the "new" operator.
-   model.setup() initializes the model.
-   The view is used to view the model.
-   The Animator is used to run the model and view.
-   The toWindow(...) makes data in the module available xxx
