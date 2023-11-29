<!-- # Overview -->

AgentScript runs in the browser. This means the models you create will be imbedded
within an html file. It looks like these:

## Inline Model

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

## External Model

You can have your Model in an external JavaScript file. The External Model would change to:

HelloModel.js

```javascript
// Import external modules need by this model
import Model from '../src/Model.js' // The URL for Model.js
import * as util from '../src/utils.js'

class HelloModel extends Model {
    constructor(worldOptions = undefined) {
        super(worldOptions)
    }

    async startup() {
        // Your code to fetch external data here. Often not needed. Expert note:
        // "async" means this uses Promises and is invoked by "async startup()"
    }

    setup() {
        // Your initialization goes here
    }

    step() {
        // Each step changes the model. That code goese here
    }
}

export default HelloModel
```

The HTML is like the Inline Model above

```html
<script type="module">
    // Your JavaScript model goes here
</script>
```

but with the

> _// Your JavaScript model goes here_

replaced by:

```javascript
import Model from '../models/HelloModel.js' // URL for where HelloModel.js is
```

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
