### What is Agentscript?

AgentScript is an open source javascript library for writing
[agent-based models](https://en.wikipedia.org/wiki/Agent-based_model).
It is inspired by the programming language
[Netlogo](https://ccl.northwestern.edu/netlogo)

It works by creating a world inhabited by Patches, Turtles, and Links. A "step" function is used to update these. You'll call this function in an Animator that insures the Model yields to the rest of the browser each step.

This is all organized in a Model that is subclassed for a particular study. Example models include a simple [HelloModel](https://code.agentscript.org/views2/hello.html), a [TravelingSalesPerson](https://code.agentscript.org/views2/tsp.html) model, and many more. You can see them [here](https://code.agentscript.org/views2/)

![Image](/config/cleantheme/static/Views2.jpg)

The left column links to the GitHub source code while the right column runs the models. They generally run 500 steps at 30 fps.

Here's what the LinkTravel model looks like:

![Image](/config/cleantheme/static/LinkTravel.jpg)

All this is a bit abstract, so we've a set of [Snippets](https://code.agentscript.org/config/cleantheme/Snippets.html) for you to play with. It looks like:

![Image](/config/cleantheme/static/Snippets.jpg)

There is a link at the end of the page to return here.

Finally, we've wrapped up the snippets into a Model [pheromone.html page](https://code.agentscript.org/views2/pheromone.html).
