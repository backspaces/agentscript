# AgentScript

AgentScript is a minimalist Agent Based modeling system based on [NetLogo](https://ccl.northwestern.edu/netlogo/) semantics.

It has a Model/View/Control (MVC) architecture which cleanly separates the three components.

-   **Model**: Provides NetLogo-like semantics for Patches, Turtles and Links. It has no colors, shapes, sizes etc for viewing the model.
-   **View**: Use the Model properties to create a view. There can be many Views. We provide a [2D Canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) view and a [Three.js](https://threejs.org/) 3D view. There is also GIS support via a general [gis module](https://github.com/backspaces/agentscript/blob/master/src/gis.js), as well as [MapBox GL GS support](https://github.com/backspaces/agentscript/blob/master/src/mbtools.js). Plot views are also available.
-   **Controls**: We use [dat.gui](https://github.com/dataarts/dat.gui) for a menu UI, a [Mouse module](https://github.com/backspaces/agentscript/blob/master/src/Mouse.js) for selecting Model objects (Patches, Turtles and Links), an [Animator](https://github.com/backspaces/agentscript/blob/master/src/Animator.js) for fine control over the Model/Draw steps.

## ES6 Modules

AgentScript is entirely ES6 Module based with [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) and [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) statements.

This allows direct access to individual modules which will automatically load only the module and its dependencies. It also allows you to create bundles which are single module versions of your code.

Example: to import Class Model for building your own model, use:

> import Model from 'path/to/agentscript/src/Model.js'

.. where path/to/agentscript is a local file system path or a url to a server:

-   agentscript.org: [http://agentscript.org/src/Model.js](http://agentscript.org/src/Model.js)
-   github.io: [https://backspaces.github.io/agentscript/src/Model.js](https://backspaces.github.io/agentscript/models/HelloModel.js)
-   unpkg.com: [https://unpkg.com/agentscript/dist/src/Model.js](https://unpkg.com/agentscript/dist/src/Model.js)

## Dual Build

AgentScript is based on es6 Modules (ESM) which are delivered as two [Rollup](https://rollupjs.org/) bundles:

```
* UMD: agentscript.umd.js
* ESM: agentscript.esm.js
```

The UMD can be used in the browser as a `<script>` tag, and in Node using `require()`

The ESM is used in es6 import statements.

Both are available in minified form. All are in the project's `dist/` directory.

The UMD's global name is `AS`

## NPM Package

AgentScript is available as a npm package: agentscript.

To install the package, `yarn add agentscript`. This places the bundles in `node_modules/agentscript/dist`

To use the package as a CDN, use [unpkg.com](https://unpkg.com/).

-   UMD: [https://unpkg.com/agentscript](https://unpkg.com/agentscript)
-   ESM: [https://unpkg.com/agentscript?module](https://unpkg.com/agentscript?module)

View the unpkg.dashboard: [https://unpkg.com/agentscript/](https://unpkg.com/agentscript/)

## Developer Information

To clone the github repo:

-   cd to where you want the agentscript/ dir to appear.
-   git clone https://github.com/backspaces/agentscript
-   cd agentscript # go to new repo
-   yarn install # install all dev dependencies
-   yarn build # complete the install

All workflow is npm run scripts. See package.json's scripts, or use `yarn run` for a list. [JavaScript Standard Style](https://standardjs.com/) is [used](https://github.com/backspaces/agentscript/blob/master/.eslintrc.json).

## Github Pages

The [github repo](https://github.com/backspaces/agentscript) is also a [github-page](), thus is a server for all the files in the repo. [gh-page](http://backspaces.github.io/agentscript/) is used for the site. It contains the dist/ dir and a models/ dir with sample models also used for testing.

It uses [the docs/ simplification](https://help.github.com/articles/user-organization-and-project-pages/#project-pages) for gh-page creation.

The gh-page hosts our sample models. The fire model can be run with:

> http://backspaces.github.io/agentscript/models?fire

The Github page can be used as a CDN for experimental use:

-   UMD: [https://backspaces.github.io/agentscript/dist/agentscript.umd.js](https://backspaces.github.io/agentscript/dist/agentscript.umd.js)
-   ESM: [https://backspaces.github.io/agentscript/dist/agentscript.esm.js](https://backspaces.github.io/agentscript/dist/agentscript.esm.js)

## Files

Our directory layout is:

```
bin: workflow scripts
dist: the umd and esm bundles with their min.js versions.
docs: gh-page
models: sample models used for tests and demos
src: individual agentscript es6 modules
test: test files
```

## License

Copyright Owen Densmore, RedfishGroup LLC, 2012-2018<br>
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
