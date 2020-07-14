# AgentScript

AgentScript is a minimalist Agent Based modeling system based on [NetLogo](https://ccl.northwestern.edu/netlogo/) semantics.

It has a Model/View/Control (MVC) architecture which cleanly separates the three components.

-   **Model**: Provides NetLogo-like semantics for Patches, Turtles and Links. It has no colors, shapes, sizes etc for viewing the model.
-   **View**: Use the Model properties to create a view. There can be many Views. We provide a [2D Canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) view and a [Three.js](https://threejs.org/) 3D view. There is also GIS support via a general [gis module](https://github.com/backspaces/agentscript/blob/master/src/gis.js), as well as [MapBox GL GS support](https://github.com/backspaces/agentscript/blob/master/src/mbtools.js). Plot views are also available.
-   **Controls**: We use [dat.gui](https://github.com/dataarts/dat.gui) for a menu UI, a [Mouse module](https://github.com/backspaces/agentscript/blob/master/src/Mouse.js) for selecting Model objects (Patches, Turtles and Links), an [Animator](https://github.com/backspaces/agentscript/blob/master/src/Animator.js) for fine control over the Model/Draw steps.

## Modern JavaScript

AgentScript is entirely ES6 Module based with [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) and [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) statements.

This allows direct access to individual modules which will automatically load only the module and its dependencies.

Example: to import Class Model for building your own model, use:

> import Model from './path/to/agentscript/src/Model.js'

.. where path/to/agentscript is a local file system path or a url to a server:

-   local: [./src/Model.js](./src/Model.js)
-   agentscript.org: [https://agentscript.org/src/Model.js](https://agentscript.org/src/Model.js)
-   unpkg.com: [https://unpkg.com/agentscript/src/Model.js](https://unpkg.com/agentscript/src/Model.js)

To create your own local agentscript files:

-   Go to: https://github.com/backspaces/agentscript
-   Click on the large green `Code` button
-   Click on `Download ZIP`. The creates the file agentscript-master.zip
-   Unzip this. Creates agentscript-master/
-   Rename/Move to where you want it.

## Files

Our directory layout is:

### The core agentscript directories:

-   [models/](https://github.com/backspaces/agentscript/tree/master/models): simple sample/demo models. All are es6 modules used in onepagers below
-   [src/](https://github.com/backspaces/agentscript/tree/master/src): all the agentscript source code. All are es6 modules

### Use of the models in one-page html demos, called "onepagers"

-   [docs/](https://github.com/backspaces/agentscript/tree/master/docs): tutorial examples
-   [gis/](https://github.com/backspaces/agentscript/tree/master/gis): Sample gis examples, inserting models into maps
-   [views2/](https://github.com/backspaces/agentscript/tree/master/views2): 2D Canvas views of all the models/
-   [views3/](https://github.com/backspaces/agentscript/tree/master/views3): Three.js views of all the models/

### Developer directories:

-   [bin/](https://github.com/backspaces/agentscript/tree/master/bin): workflow scripts
-   [dist/](https://github.com/backspaces/agentscript/tree/master/dist): the umd and esm bundles with their min.js versions and src/.
-   [models/scripts/](https://github.com/backspaces/agentscript/tree/master/models/scripts): `<script>` versions of models/.<br>
    Used by legacy models, test/, and workers. test/ uses workers for speed.
-   [test/](https://github.com/backspaces/agentscript/tree/master/test): testing in browser for all models/ using [Puppeteer](https://github.com/puppeteer/puppeteer#puppeteer)
-   [vendor/](https://github.com/backspaces/agentscript/tree/master/vendor): es6 versions of third party libraries used by onepagers.
-   [workflow/](https://github.com/backspaces/agentscript/tree/master/workflow): tools for creating "bundles".<br>
    Note that many of these will be removed as es6 modules fully supported by our dependencies. For example models/scripts will be removed when workers can use import statements in all browsers. Safari, we're talking about you! Ditto for vendor/ as all dependencies offer es6 modules.

Click on the directory name to see it on github. Click on the individual file names to see them nicely formatted.

## Run the demos in the directories mentioned above.

The Models directory contains the individual Models JavaScript files exporting a Model. It is the only directory with .js files, the rest are "onepagers" .html files. Notice the links use "query parameters" that the index.html file uses to run the model. The output is a random sample of the model's results.

<!-- [models](./models/README.md) -->

<!-- [models](https://github.com/backspaces/agentscript/blob/master/models/README.md) -->

<hr>
Several tests for accessing README's. Note models also has an index.html so will run the hello model when pointing at a dir. For that case, this works.
[models](https://github.com/backspaces/agentscript/blob/master/models/README.md)
<hr>
Absolute URL to READMEs
<hr>

[models](https://agentscript.org/models/README.md)

[views2](https://agentscript.org/views2/README.md)

[views3](https://agentscript.org/views3/README.md)

[gis](https://agentscript.org/gis/README.md)

[docs](https://agentscript.org/docs/README.md)

<hr>
Relative URL to READMEs
<hr>

[models](./models/README.md)

[views2](./views2/README.md)

[views3](./views3/README.md)

[gis](./gis/README.md)

[docs](./docs/README.md)

<hr>
Absolute URL to Dir
<hr>

[models](https://agentscript.org/models/)

[views2](https://agentscript.org/views2/)

[views3](https://agentscript.org/views3/)

[gis](https://agentscript.org/gis/)

[docs](https://agentscript.org/docs/)

<hr>
Relative URL to Dir
<hr>

[models](./models/)

[views2](./views2/)

[views3](./views3/)

[gis](./gis/)

[docs](./docs/)

<hr>
Absolute URL to Github Repo
<hr>

[models](https://github.com/backspaces/agentscript/blob/master/models/README.md)

[views2](https://github.com/backspaces/agentscript/blob/master/views2/README.md)

[views3](https://github.com/backspaces/agentscript/blob/master/views3/README.md)

[gis](https://github.com/backspaces/agentscript/blob/master/gis/README.md)

[docs](https://github.com/backspaces/agentscript/blob/master/docs/README.md)

## Developer Information

To clone the github repo:

-   cd to where you want the agentscript/ dir to appear.
-   git clone https://github.com/backspaces/agentscript
-   cd agentscript # go to new repo
-   yarn install # install all dev dependencies.
-   yarn build # complete the install.
-   yarn run build-vendor # build depend<br>
    Note: Fine to use npm rather than yarn.

All workflow is npm run scripts. See package.json's scripts, or use `yarn/npm run` for a list. [JavaScript Standard Style](https://standardjs.com/) is [used](https://github.com/backspaces/agentscript/blob/master/.prettierrc.js).

## License

Copyright Owen Densmore, RedfishGroup LLC, 2012-2020<br>
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
