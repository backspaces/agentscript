## What is Agentscript?

AgentScript is an open source javascript library for writing
[agent-based models](https://en.wikipedia.org/wiki/Agent-based_model).
It is inspired by the programming language
[Netlogo](https://ccl.northwestern.edu/netlogo). It uses the [Model, View, Controller](https://developer.mozilla.org/en-US/docs/Glossary/MVC) (MVC) architecture. It lives on Github and is publicly available on our AgentScript.org server, see above.

AgentScript creates Models inhabited by Patches, Turtles, and Links. You'll use all three in the "Snippets" example below.

All your models will have a _startup()_ and _step()_ function, which initializes and steps/updates your model by modifying the Patches, Turtles, and Links and their associated data.

## MVC

In terms of MVC, the Model contains the data (the Patches, Turtles, and Links). The View uses this data to visualize the Model. The Controller provides the user a way to modify the running model. An example would be a GUI for pause/start the model.

![Image](/config/cleantheme/static/MVC.jpg)

Concretely, the Model very roughtly follows this outline:

```javascript
// Extend the core Model for our Model, here HelloModel
class HelloModel extends Model {
    // define data to bue used by the model

    constructor(..) {
        // sets up the Patches (a width/height grid) and
        // initializes an empty Turtles & Links array
    }

    setup() {
        // creates the initial set of Turtles and Links
    }

    step() {
        // Evolve the Model by Turtles and modifying data
    }
}
```

Here it is [running](https://code.agentscript.org/views1/hello.html)

Similarly, the View makes this visible like this [2D view](https://code.agentscript.org/views2/hello.html) or this [3D view](https://code.agentscript.org/views25/hello3d.html), both with the same Model! This is important: once a Model is defined, it can be viewed in many different ways.

Finally, the Controllers let you interact with the Model & View. Here's an example using a [GUI Controller](https://code.agentscript.org/mvc/hello.html).

<!-- You'll call this function in an Animator that insures the Model yields to the rest of the browser each step. -->

## Examples

Example models include a simple [HelloModel](https://code.agentscript.org/views2/hello.html), a [TravelingSalesPerson](https://code.agentscript.org/views2/tsp.html) model, and many more. You can see 2D versions [here](https://code.agentscript.org/views2/).

![Image](/config/cleantheme/static/Views2.jpg)

The left column links to the GitHub source code while the right column runs the models. They generally run 500 steps at 30 fps.

Here's what the [LinkTravel model](https://code.agentscript.org/views2/linktravel.html) looks like:

![Image](/config/cleantheme/static/LinkTravel.jpg)

Go on over there to see more nifty models, maybe see on you would like to understand and modify.

Oh, and these are shown in 2D. Here you can see [2.5D](https://code.agentscript.org/views25/) and [3D](https://code.agentscript.org/views3/)

## Snippets

All this is a bit abstract, so we've a set of [Snippets](https://code.agentscript.org/config/cleantheme/Snippets.html) for you to play with. It lets you see and modify Patches, Turtles, and Links, the primitives used by AgentScript. Really, go there to get a hands-on experience!

Use the browser's back button to return here.

It looks like this:

![Image](/config/cleantheme/static/Snippets.jpg)

Finally, we've wrapped up the Snippets into a Model: [pheromone.html](https://code.agentscript.org/views2/pheromone.html) using the Snippet's examples.

![Image](/config/cleantheme/static/PheromoneView.jpg)

## Don't Panic!!

This has been a pretty quick ride through what AgentScript can do.
It can be pretty overwhelming, but dont worry, we'll dig into how you can make these models soon.

The key take-aways are:

-   Models are made up of Patches, Turtles and Links.
-   [Snippets](https://code.agentscript.org/config/cleantheme/Snippets.html) let you play with these.
-   Models are Classes with a constructor, startup() and step() methods.
-   The MVC architecture is used, separating the Model, View, and Controller.
-   This lets the same Model be deployed in 2D, 3D and so on.
-   The Controllers give you an easy way to interact with the Model and View.
