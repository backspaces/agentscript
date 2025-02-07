# AgentScript

AgentScript is a minimalist Agent Based modeling system based on [NetLogo](https://ccl.northwestern.edu/netlogo/) semantics. We also have an [IDE](https://code.agentscript.org/ide/index.html), especially useful for getting started.

It has a Model/View/Control (MVC) architecture which cleanly separates the three components.

-   **Model**: Provides NetLogo-like semantics for Patches, Turtles and Links. It has no colors, shapes, sizes etc for viewing the model.

-   **View**: Use the Model properties to create a view. There can be many Views. We provide a [2D Canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) view and a [Three.js](https://threejs.org/) 2.5D and 3D views. There is also GIS support via a [gis module](https://github.com/backspaces/agentscript/blob/master/src/gis.js), a [geojson module](https://github.com/backspaces/agentscript/blob/master/src/geojson.js), as well as [Leaflet](https://leafletjs.com/) and [MapLibre](https://github.com/maplibre/maplibre-gl-js#readme/) based maps. Plot views are also available.

-   **Controls**: We use [src/GUI.js](https://code.agentscript.org/src/GUI.js) via [dat.gui](https://github.com/dataarts/dat.gui) for a menu UI, a [Mouse module](https://github.com/backspaces/agentscript/blob/master/src/Mouse.js) for selecting Model objects (Patches, Turtles and Links), an [Animator](https://github.com/backspaces/agentscript/blob/master/src/Animator.js) for fine control over the Model/Draw steps. We also have [Keyboard](https://github.com/backspaces/agentscript/blob/master/src/Keyboard.js) and [Buttons](https://github.com/backspaces/agentscript/blob/master/src/Buttons.js) controls.

## Modern JavaScript

AgentScript is entirely ES6 Module based with [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) and [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) statements.

This allows direct access to individual modules which will automatically load only the module and its dependencies.

Example: to import Class Model for building your own model, use:

> import Model from 'https://code.agentscript.org/src/Model.js'

## Run demos

The models directory contains the individual Models JavaScript files.

[models](https://code.agentscript.org/models/)

The views1 onepagers import models from the models/ dir and run for 500 steps, printing out a sample of the model's data.

[views1](https://code.agentscript.org/views1/)

The views2 onepagers import models from the models/ dir and add a 2D Canvas view.

[views2](https://code.agentscript.org/views2/)

The views2mv (mv: model/view) onepagers import models from the models/ dir and add a 2D Canvas view as a separate file.

[views2mv](https://code.agentscript.org/views2mv/)

The views25 onepagers import models from the models/ dir and add a Three.js webgl 2.5D view.

[views25](https://code.agentscript.org/views25/)

The views3 onepagers import models from the models/ dir and add a Three.js webgl 3D view.

They are similar to the views25 onepagers but use
[src/Model3D.js](https://github.com/backspaces/agentscript/blob/master/src/Model3D.js)
and [src/Turtle3D.js](https://github.com/backspaces/agentscript/blob/master/src/Turtle3D.js)
which are subclasses of their 2D counterparts:
[src/Model.js](https://github.com/backspaces/agentscript/blob/master/src/Model.js)
and [src/Turtle.js](https://github.com/backspaces/agentscript/blob/master/src/Turtle.js)

[views3](https://code.agentscript.org/views3/)

The mvc onepagers are combine Models, Views, and Controls into "apps".

[mvc](https://code.agentscript.org/mvc/)

AgentScript provides a way to include your models on a map. These two sets of onepagers use gis & geojson utilities to create and view models running on [Leaflet](https://leafletjs.com/) and [maplibre](https://github.com/maplibre/maplibre-gl-js#readme/) maps.

[leaflet](https://code.agentscript.org/leaflet)

and

[maplibre](https://code.agentscript.org/maplibre/)

<!-- [fb](./fb/README.md)

An experimental distributed framework for running models in one page while listening & getting results in another. We call these Model Transforms. They currently show their results in the browser console. -->

## Developer

To create your own local agentscript files:

-   Go to: https://github.com/backspaces/agentscript
-   Click on the large green `Code` button
-   Click on `Download ZIP`. The creates the file agentscript-master.zip
-   Unzip this. Creates agentscript-master/
-   Rename/Move to where you want it.

### The core agentscript directories:

The models directory contains the individual Models JavaScript files. I.e. HelloModel.js exports the HelloModel etc. It is the only demo directory with .js files, the rest are .html files.

-   [models/](https://github.com/backspaces/agentscript/tree/master/models): simple sample/demo models. All are es6 modules used in onepagers below
-   [src/](https://github.com/backspaces/agentscript/tree/master/src): all the agentscript source code. All are es6 modules
-   [docs/](https://code.agentscript.org/docs/) Documentation for all the individual modules used by the programmer.

### Developer directories:

-   [bin/](https://github.com/backspaces/agentscript/tree/master/bin): workflow scripts
-   [dist/](https://unpkg.com/browse/agentscript/dist/): the umd and esm bundles with their min.js versions and src/.
-   [test/](https://github.com/backspaces/agentscript/tree/master/test): testing using Deno with it's browser environment running all models/ using its test feature to report errors.
-   [config/](https://github.com/backspaces/agentscript/tree/master/config): tools for creating "bundles".<br>

## Developer Information

Most users need not worry about this, you can access all the AgentScript code as described above using local files or servers. This is for those wishing to build the AgentScript system itself.

To clone the github repo:

-   cd to where you want the agentscript/ dir to appear.
-   git clone https://github.com/backspaces/agentscript
-   cd agentscript # go to new repo
-   yarn install # install all dev dependencies.
-   yarn build # install all our dependencies.
    Note: Fine to use npm rather than yarn.

All workflow is npm run scripts. See package.json's scripts, or use `yarn/npm run` for a list of all scripts. [JavaScript Standard Style](https://standardjs.com/) is used, see the [prettierrc.js](https://github.com/backspaces/agentscript/blob/master/.prettierrc.js).

## License

Copyright Owen Densmore, RedfishGroup LLC, 2012-2023<br>
AgentScript may be freely distributed under the GPLv3 license:

AgentScript is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program, see LICENSE within the distribution.
If not, see <http://www.gnu.org/licenses/>.
