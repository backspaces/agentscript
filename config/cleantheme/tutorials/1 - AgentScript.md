## What is Agentscript?

AgentScript is an open source javascript library for writing
[agent-based models](https://en.wikipedia.org/wiki/Agent-based_model).
It is inspired by the programming language
[Netlogo](https://ccl.northwestern.edu/netlogo). It uses the [Model, View, Controller](https://developer.mozilla.org/en-US/docs/Glossary/MVC) (MVC) architecture.

AgentScript creates Models inhabited by Patches, Turtles, and Links. You'll use all three in the Snippets example below.

All your models will have a "startup" and "step" function, which initializes and steps/updates your model by modifying the Patches, Turtles, and Links and their associated data.

In terms of MVC, the Model contains the data (the Patches, Turtles, and Links). The View uses this data to visualize the Model. The Controller updates the Model via it's step function and the View uses the new data to create an animation of the process.

![Image](/config/cleantheme/static/MVC.jpg)

<!-- You'll call this function in an Animator that insures the Model yields to the rest of the browser each step. -->

This is all organized within a Model that is subclassed for a particular study. Example models include a simple [HelloModel](https://code.agentscript.org/views2/hello.html), a [TravelingSalesPerson](https://code.agentscript.org/views2/tsp.html) model, and many more. You can see them [here](https://code.agentscript.org/views2/)

![Image](/config/cleantheme/static/Views2.jpg)

The left column links to the GitHub source code while the right column runs the models. They generally run 500 steps at 30 fps via the Controller.

Here's what the [LinkTravel model](https://code.agentscript.org/views2/linktravel.html) looks like:

![Image](/config/cleantheme/static/LinkTravel.jpg)

## Snippets

All this is a bit abstract, so we've a set of [Snippets](https://code.agentscript.org/config/cleantheme/Snippets.html) for you to play with. It lets you see and modify Turtles, Links, and Patches, the primitives used by AgentScript. (Use the browser's back button to return here.)

It looks like this:

![Image](/config/cleantheme/static/Snippets.jpg)

Finally, we've wrapped up the Snippets into a Model: [pheromone.html](https://code.agentscript.org/views2/pheromone.html).

## Notes

The use of "../" in the import URLs above are due to the file layouts:
All the External Model files are in the top lever models/ directory while
the two imports are in the top level src/ dir. So "../" gets me to the top level
and "../src" into the src/ directory.

Here is HelloModel.js running withiin the hello.html HTML file:
[views1/hello.html](../views1/hello.html)

You'll notice that the model simply runs 500 steps then prints out a random
sampling of its result.

Where's the pretty View?

## Views (Model/View/Controller)

The reason for this is that AgentScript uses the Model/View/Controller (MVC) architecture.
In this case, it means the Model, by itself, is simple Data in, and updated each step().
Thus far we've only discussed the Model. So views1/hello.html just shows the Model.

Here a 2D view: [views2/hello.html](../views2/hello.html)

Because the Model is separate, it is easy to create additional views as well.

Here are a 2.5D and 3D version with little change.

Here's 2.5D (simply adding Z): [views25/hello3d.html](../views25/hello3d.html)

And here a true 3D, with Yaw, Pitch, Roll and 3D turtles: [views3/hello3d.html](../views3/hello3d.html)

Because the MVC components are separate modules, it's quite easy to put Models
in different environments, as we show above with 2D, 2.5D and 3D Vviews.
Even more flexiblity will show up when we embed Models with 2D Views onto Maps!

BTW: MVC makes building Models simpler: use the views1 "View" above to run just the Model.
Then when it runs without problems, add a View.
