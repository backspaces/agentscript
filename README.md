# AgentScript

AgentScript is a minimalist Agent Based modeling system based on [NetLogo](https://ccl.northwestern.edu/netlogo/) semantics.

It has a Model/View architecture for which this is the Model. A set of Views will be provided in the future.

One such Three.js View is provided by [as-app3d](https://github.com/backspaces/as-app3d). Here is [fire model](http://backspaces.github.io/as-app3d/models/?fire), and a [flocking model](http://backspaces.github.io/as-app3d/models/?flock).

[Obserable](https://beta.observablehq.com/) is also useful for Views, see: [this example](https://beta.observablehq.com/@sdwfrost/agentscript-core)

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
AgentScript is available as a npm *scoped* package: @redfish/agentscript.

To install the package, `yarn add @redfish/agentscript`. This places the bundles in `node_modules/@redfish/agentscript/dist`

To use the package as a CDN, use [unpkg.com](https://unpkg.com/).
* UMD: [https://unpkg.com/@redfish/agentscript](https://unpkg.com/@redfish/agentscript)
* ESM: [https://unpkg.com/@redfish/agentscript?module](https://unpkg.com/@redfish/agentscript?module)

## Developer Information

To clone the github repo:
* cd to where you want the agentscript/ dir to appear.
* git clone https://github.com/backspaces/agentscript
* cd agentscript # go to new repo
* yarn install # install all dev dependencies
* yarn build # complete the install

All workflow is npm run scripts.  See package.json's scripts, or use `yarn run` for a list. [JavaScript Standard Style](https://standardjs.com/) is [used](https://github.com/backspaces/agentscript/blob/master/.eslintrc.json).

## Github Pages

A [gh-page](http://backspaces.github.io/agentscript/) is used for the site. It contains the dist/ dir and a models/ dir with sample models also used for testing.

It uses [the docs/ simplification](https://help.github.com/articles/user-organization-and-project-pages/#project-pages) for gh-page creation.

The gh-page hosts our sample models. The fire model can be run with:
> http://backspaces.github.io/agentscript/models?fire


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
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program, see LICENSE within the distribution.
If not, see <http://www.gnu.org/licenses/>.
