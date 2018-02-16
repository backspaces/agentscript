# AgentScript

AgentScript is a minimalist Agent Based modeling system based on [NetLogo](https://ccl.northwestern.edu/netlogo/) semantics.

It has a Model/View architecture for which this is the Model. A set of Views will be provided in the future.

One such Three.js View is provided by [ASX](https://github.com/backspaces/asx). Here is [fire model](http://backspaces.github.io/asx/models/?fire), and a [flocking model](http://backspaces.github.io/asx/models/?flock).

[Obserable](https://beta.observablehq.com/) is also useful for Views, see: [this example](https://beta.observablehq.com/@sdwfrost/agentscript-core)

## Developer Information

To clone a fresh repo, for PRs or your own local version:
* cd to where you want the agentscript/ dir to appear.
* git clone https://github.com/backspaces/agentscript
* cd agentscript # go to new repo
* yarn install # install all dev dependencies
* yarn build # complete the install

All workflow is npm run scripts.  See package.json's scripts, or simply run `yarn run` for a list. [JavaScript Standard Style](https://standardjs.com/) is [used](https://github.com/backspaces/agentscript/blob/master/.eslintrc.json).

## Github Pages

A [gh-page](http://backspaces.github.io/agentscript/) is used for the site. It contains the master repo, including the derived files.

It uses [the docs/ simplification](https://help.github.com/articles/user-organization-and-project-pages/#project-pages) for gh-page creation.

The gh-page can be used as a CDN for our distribution, see [**Modules and Bundles**](#modules-and-bundles) below.

## Modules and Bundles

agentscript is an entirely es6 Modules based, dual deploy. By "dual" we mean that we support es6 Modules, along with UMD Modules for `<script>` tags and node require().

The dist/ dir includes both a [Rollup](https://rollupjs.org/) generated [IIFE](http://adripofjavascript.com/blog/drips/an-introduction-to-iffes-immediately-invoked-function-expressions.html) global, window.AS, for script users.

It can also be used as a CDN for all the es6 Modules:

* `import {ColorMap, Model, util} from` '[http://backspaces.github.io/agentscript/dist/agentscript.esm.js](http://backspaces.github.io/agentscript/dist/agentscript.esm.js)'

Finally, they are also available as a traditional legacy IIFE Rollup bundle:
* `<script src="`[http://backspaces.github.io/agentscript/dist/agentscript.umd.js](http://backspaces.github.io/agentscript/dist/agentscript.umd.js)`"></script>`


## Files

Our directory layout is:
```
bin: workflow scripts
dist: agentscript.umd.js & agentscript.esm.js bundles & AS/ es6 source.
docs: gh-page
models: test/demo models
src: es6 modules for AS
test: AvA test files
```

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
