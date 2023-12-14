<!-- # View -->

To "see" the model running, we need the V in MVC .. the View. There are several views available, we'll use [TwoDraw.js](/src/TwoDraw.js)

You can see this in action with our [PheronomeModel](/views2/pheromone.html) and see the code via the [view-source capability](https://www.computerhope.com/issues/ch000746.htm)

### TwoDraw

First, the Pheromone Model does not change. Rather you add TwoDraw and modify the HTML.

-   We add new imports: TwoDraw, ColorMap, Animator
-   We create a colorMap, like we saw in Snippets
-   We instantiate the PheromoneModel model
-   We instantiate TwoDraw
-   And finally we introduce an Animator which runs the model and view.

### TwoDraw HTML

```html
<head>
    <title>Pheromone</title>
</head>

<body>
    <script type="module">
        import * as util from '../src/utils.js'
        import TwoDraw from '../src/TwoDraw.js'
        import ColorMap from '../src/ColorMap.js'
        import Animator from '../src/Animator.js'
        import Model from '../models/PheromoneModel.js'

        const colorMap = ColorMap.gradientColorMap(
            8, ['black', 'purple', 'yellow']
        )

        const model = new Model() // no arge => use default world options
        model.setup()

        const view = new TwoDraw(model, {
            div: 'modelDiv',
            patchSize: 20,
            drawOptions: {
                turtlesSize: 2,
                patchesColor: (p) => colorMap.scaleColor(p.pheromone, 0, 100)
            }
        })

        const anim = new Animator(
            () => {
                model.step()
                view.draw()
            },
            500, // run 500 steps
            30 // 30 fps
        )

        // For debugging, makes properties available globally. OK to skip.
        util.toWindow({ util, model, view, anim })
    </script>
    <div id="modelDiv"></div>
</body>

</html>
```

### TwoDraw Options

TwoDraw above takes the HTML div where we will place the view and the size of patches in pixels.
It also takes drawOptions containing the drawing properties. Here are the defaults.

```javascript
    static defaultOptions(model) {
        return {
            patchesColor: 'random',
            initPatches: null,

            turtles: model.turtles,
            turtlesColor: 'random',
            turtlesStrokeColor: 'random',
            turtlesShape: 'dart',
            turtlesSize: 1,
            turtlesRotate: true,

            links: model.links,
            linksColor: 'random',
            linksWidth: 1,

            textProperty: null,
            textSize: 0.5,
            textColor: 'black',

            patchesMap: 'DarkGray',
            turtlesMap: 'Basic16',
        }
    }
```

You can quickly see your model by ommitting the drawOptions thus giving you defaults.

```javascript
    drawOptions: {
        turtlesSize: 2,
        patchesColor: (p) => colorMap.scaleColor(p.pheromone, 0, 100)
    }
```

..you'll get this:

![Image](/config/cleantheme/static/TwoDraw0.jpg)

.. which lets you see that the view is working.

Adding back the drawOptions for turtleSize (in patches) and a function for patchesColor
using the colorMap, you'll get:

![Image](/config/cleantheme/static/TwoDraw1.jpg)

<!-- [Foo](#pheromone-output)

[Bar](./Model.md) -->
