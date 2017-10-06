# AgentScript-next Repository

This is a repository for the next version of the [AgentScript 1.0](http://agentscript.org) Agent Based Modeling framework, converted into an es6 module based project using Three.js.

## Developer Information

To clone a fresh repo, for PRs or your own local verson:
* cd to where you want the asx/ dir to appear.
* git clone https://github.com/backspaces/asx # create skeleton repo
* cd asx # go to new repo
* npm install # install all dev dependencies
* npm run build # complete the install
* open `http://<path to asx>/models` to run a model. Check console for messages

All workflow is npm run scripts.  See package.json's scripts, or simply run `npm run` for a list. [JavaScript Standard Style](https://standardjs.com/) is [used](https://github.com/backspaces/asx/blob/master/.eslintrc.json).

The repo has no "derived" files, other than the gh-page, see below, i.e. won't run by just cloning. To complete the install, use `npm install` and `npm run build` which refreshes npm dependencies and does a clean build of the repo.

## Github Pages

A [gh-page](http://backspaces.github.io/asx/) is used for the site. It contains the master repo, including the derived files, and is our documentation.

It uses [the docs/ simplification](https://help.github.com/articles/user-organization-and-project-pages/#project-pages) for gh-page creation. We use [Docsify](https://docsify.js.org/#/?id=docsify), a dynamic markdown based documentation system, which you'll see when you go to the gh-page.

The gh-page can be used to run example models:
* [http://backspaces.github.io/asx/models?diffuse](http://backspaces.github.io/asx/models?diffuse)

And as a CDN for modules and legacy bundles, see [**Modules and Bundles**](#modules-and-bundles) below.

## Three.js

We have converted from layers of 2D canvases to a single WebGL canvas, currently managed by [Three.js](https://threejs.org/). This is a breaking change, primarily changing subclassing of class Model. Each of the prior layers is now a single Three Mesh within the Three scene graph.

To configure the Three parameters, we've introduced a second configuration object for renderers. The Model constructor thus is:

```
// The Model constructor takes a DOM div and model and renderer options.
// Default values are given for all constructor arguments.
constructor (div = document.body,
             modelOptions = Model.defaultWorld(),
             rendererOptions = Model.defaultRenderer()) {
```

The conversion of the [fire](http://backspaces.github.io/asx/models?fire) model, [source here](https://github.com/backspaces/asx/blob/master/models/src/fire.js), is an example of the minor changes needed in converting to Three.js.

## Modules and Bundles

ASX is an entirely es6 Modules based, dual deploy. By "dual" we mean that we support es6 Modules, along with legacy `<script>` tags, both in our models/index.html files and the individual demo models.

The dist/ dir includes both a [Rollup](https://rollupjs.org/) generated legacy [IIFE](http://adripofjavascript.com/blog/drips/an-introduction-to-iffes-immediately-invoked-function-expressions.html) global, window.AS, for script users, and the AS/ dir of the modules for direct native module implementations (Canary, Edge, FFox Nightly, iOS Safari and Safari Technology Preview), see the [CanIUse](http://caniuse.com/#search=modules) page for current browser support.

It can also be used as a CDN for all the es6 Modules:

* `import Model from` '[http://backspaces.github.io/asx/dist/AS/Model.js](http://backspaces.github.io/asx/dist/AS/Model.js)'

The es6 modules are also available as a single Rollup es6 Module bundle
* `import {ColorMap, Model, util} from` '[http://backspaces.github.io/asx/dist/AS.module.js](http://backspaces.github.io/asx/dist/AS.module.js)'

Finally, they are also available as a traditional legacy IIFE Rollup bundle:
* `<script src="`[http://backspaces.github.io/asx/dist/AS.js](http://backspaces.github.io/asx/dist/AS.js)`"></script>`


## Files

Our directory layout is:
```
bin: workflow scripts
dist: AS.js & AS.module.js bundles & AS/ es6 source.
docs: gh-page
models: sample models
src: es6 modules for AS
```

Within models/ are src/ (es6 modules) and scripts/ (legacy) and an index.html which runs the src/scripts files as a query string/REST. Both index.html files have a default model if no query string given.

There are currently two ways to run a sample model: es6 modules (src/) or legacy scripts (scripts/), the former runs only in browsers supporting modules (see above):

* [http://backspaces.github.io/asx/models?scripts/fire](http://backspaces.github.io/asx/models?scripts/fire)
* [http://backspaces.github.io/asx/models?src/fire](http://backspaces.github.io/asx/models?src/fire)

The default directory is scripts/ for now, but will convert to es6 modules, src/, when widely supported. This url will use the default:

* [http://backspaces.github.io/asx/models?fire](http://backspaces.github.io/asx/models?fire)

The current sample models are: diffuse, exit, fire, links, turtles

## License

Copyright Owen Densmore, RedfishGroup LLC, 2012-2017<br>
AgentScript may be freely distributed under the GPLv3 license:

AgentScript is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program, see LICENSE within the distribution.
If not, see <http://www.gnu.org/licenses/>.
