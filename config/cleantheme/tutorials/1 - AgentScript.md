## What is Agentscript?

AgentScript is an open source javascript library for writing
[agent-based models](https://en.wikipedia.org/wiki/Agent-based_model).
It is inspired by the programming language
[Netlogo](https://ccl.northwestern.edu/netlogo). It uses the [Model, View, Controller](https://developer.mozilla.org/en-US/docs/Glossary/MVC) (MVC) architecture. It lives on Github and is publicly available on our AgentScript.org server, see above.

AgentScript creates Models inhabited by Patches, Turtles, and Links. You'll use all three in the Snippets example below.

All your models will have a "startup" and "step" function, which initializes and steps/updates your model by modifying the Patches, Turtles, and Links and their associated data.

## MVC

In terms of MVC, the Model contains the data (the Patches, Turtles, and Links). The View uses this data to visualize the Model. The Controller provides the user a way to modify the running model. An example would be a GUI for pause/start the model.

![Image](/config/cleantheme/static/MVC.jpg)

<!-- You'll call this function in an Animator that insures the Model yields to the rest of the browser each step. -->

## Models

This is all organized within a Model that is subclassed for a particular study. Example models include a simple [HelloModel](https://code.agentscript.org/views2/hello.html), a [TravelingSalesPerson](https://code.agentscript.org/views2/tsp.html) model, and many more. You can see them [here](https://code.agentscript.org/views2/).

![Image](/config/cleantheme/static/Views2.jpg)

The left column links to the GitHub source code while the right column runs the models. They generally run 500 steps at 30 fps.

Here's what the [LinkTravel model](https://code.agentscript.org/views2/linktravel.html) looks like:

![Image](/config/cleantheme/static/LinkTravel.jpg)

Go on over there to see more nifty models, maybe see on you would like to understand and modify.

Oh, and these are shown in 2D. Here you can see [2.5D](https://code.agentscript.org/views25/) and [3D](https://code.agentscript.org/views3/)

## Snippets

All this is a bit abstract, so we've a set of [Snippets](https://code.agentscript.org/config/cleantheme/Snippets.html) for you to play with. It lets you see and modify Turtles, Links, and Patches, the primitives used by AgentScript. Really, go there to get a hands-on experience!

Use the browser's back button to return here.

It looks like this:

![Image](/config/cleantheme/static/Snippets.jpg)

Finally, we've wrapped up the Snippets into a Model: [pheromone.html](https://code.agentscript.org/views2/pheromone.html) using the Snippet's examples.

![Image](/config/cleantheme/static/PheromoneView.jpg)

## Don't Panic!!

This has been a pretty quick ride through what AgentScript can do.
t can be pretty overwhelming, but dont worry, we'll dig into how you can make these models soon, don't worry.
