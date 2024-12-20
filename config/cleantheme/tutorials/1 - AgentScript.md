## What is AgentScript?

AgentScript is an open source javascript library for writing
[agent-based models](https://en.wikipedia.org/wiki/Agent-based_model).
It is inspired by the programming language
[NetLogo](https://ccl.northwestern.edu/netlogo). It uses the [Model, View, Controller](https://developer.mozilla.org/en-US/docs/Glossary/MVC) (MVC) architecture. It lives on Github and is publicly available on our AgentScript.org server, see [Home](https://code.agentscript.org/docs/) above.

AgentScript creates Models inhabited by Patches, Turtles, and Links. You'll use all three in the "Snippets" example below.

All your models will have a _startup()_ and _step()_ function, which initializes and steps/updates your model by modifying the Patches, Turtles, and Links and their associated data.

## MVC

In terms of MVC, the Model contains the data (the Patches, Turtles, and Links). The View uses this data to visualize the Model. The Controller provides the user a way to modify the running model. An example Controller would be a GUI for pause/start the model.

![Image](/config/cleantheme/static/MVC.jpg)

Concretely, the Model very roughly follows this outline:

```javascript
// Subclass class Model to create our new model, HelloModel
class HelloModel extends Model {
    // worldOptions = undefined, means use default worldOptions:
    // 33 x 33 patches with 0,0 origin at the center.
    constructor(worldOptions = undefined) {
        super(worldOptions)
    }

    setup() {
        // creates the initial set of Turtles and Links
    }

    step() {
        // Evolve the Model by Turtles and modifying data
    }
}
```

Here it is [running](https://code.agentscript.org/views1/hello.html) 500 steps and printing a sample of the resultant data.

Similarly, the View makes this visible like this [2D view](https://code.agentscript.org/views2mv/hello.html) or this [3D view](https://code.agentscript.org/views25/hello3d.html), both with the same Model! This is important: once a Model is defined, it can be viewed in many different ways.

Finally, the Controllers let you interact with the Model & View. Here's an example using a [GUI Controller](https://code.agentscript.org/mvc/helloGui.html).

## Examples

AgentScript has many (over 100!) example models in several directories:

-   [views1](https://code.agentscript.org/views1) Runs models in a HTML text view
-   [views2mv](https://code.agentscript.org/views2mv) Runs 2D models with x, y coordinates
-   [views25](https://code.agentscript.org/views25) Runs "2 and a half D" models with x, y, z coordinates
-   [views3](https://code.agentscript.org/views3) Runs 3D models with x, y, z coordinates, 3D shapes with tilt, pitch and roll capabilities.
-   [mvc](https://code.agentscript.org/mvc) Adds controllers to some of the above views.
-   [leaflet](https://code.agentscript.org/leaflet) and [maplibre](https://code.agentscript.org/maplibre) GIS models using the Leaflet and MapLibre libraries.

Click on the views2mv directory above, you'll see:

<!-- You can see 2D versions [here](https://code.agentscript.org/views2mv/). -->

![Image](/config/cleantheme/static/views2mv.jpg)

The left column links to the GitHub source code while the right column runs the models. They generally run 500 steps at 30 fps.

Here's what the [LinkTravel model](https://code.agentscript.org/views2mv/linktravel.html) looks like:

![Image](/config/cleantheme/static/LinkTravel.jpg)

Go on over there to see more nifty models, maybe see one you would like to understand and modify. We'll show how in our Server tutorial.

Oh, and these are shown in 2D. Here you can see [2.5D](https://code.agentscript.org/views25/) and [3D](https://code.agentscript.org/views3/) demos. And note the "hello" demos in each case use the same Model, but with different Views. Explore all the directories!

## Snippets

All this is a bit abstract, so we've a set of [Snippets](https://code.agentscript.org/config/cleantheme/Snippets.html) for you to play with. It lets you see and modify Patches, Turtles, and Links, the primitives used by AgentScript. Really, go there to get a hands-on experience!

Use the browser's back button to return here.

It looks like this:

![Image](/config/cleantheme/static/Snippets.jpg)

Finally, we've wrapped up the Snippets into a Model: [pheromone.html](https://code.agentscript.org/views2mv/pheromone.html) using the Snippet's examples.

![Image](/config/cleantheme/static/PheromoneView.jpg)

## Don't Panic!!

This has been a pretty quick ride through what AgentScript can do.
It can be pretty overwhelming, but don't worry, we'll dig into how you can make these models soon.

The key take-away's are:

-   Models are made up of Patches, Turtles and Links.
-   [Snippets](https://code.agentscript.org/config/cleantheme/Snippets.html) let you play with these.
-   Models are Classes with a constructor, startup() and step() methods.
-   The MVC architecture is used, separating the Model, View, and Controller.
-   This lets the same Model be deployed in 2D, 3D, GIS and so on.
-   The Controllers give you an easy way to interact with the Model and View.
