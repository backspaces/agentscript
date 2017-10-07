# Core AgentScript Repository

This is a repository for the modeling core for [AgentScript](https://github.com/backspaces/asx).

## Developer Information

To clone a fresh repo, for PRs or your own local version:
* cd to where you want the CoreAS/ dir to appear.
* git clone https://github.com/backspaces/CoreAS
* cd CoreAS # go to new repo
* npm install # install all dev dependencies
* npm run build # complete the install

All workflow is npm run scripts.  See package.json's scripts, or simply run `npm run` for a list. [JavaScript Standard Style](https://standardjs.com/) is [used](https://github.com/backspaces/CoreAS/blob/master/.eslintrc.json).

The repo has no "derived" files, other than the gh-page, see below, i.e. won't run by just cloning. To complete the install, use `npm install` and `npm run build` which refreshes npm dependencies and does a clean build of the repo.

## Github Pages

A [gh-page](http://backspaces.github.io/CoreAS/) is used for the site. It contains the master repo, including the derived files.

It uses [the docs/ simplification](https://help.github.com/articles/user-organization-and-project-pages/#project-pages) for gh-page creation.

The gh-page can be used as a CDN for our distribution, see [**Modules and Bundles**](#modules-and-bundles) below.

## Modules and Bundles

CoreAS is an entirely es6 Modules based, dual deploy. By "dual" we mean that we support es6 Modules, along with legacy `<script>` tags.

The dist/ dir includes both a [Rollup](https://rollupjs.org/) generated legacy [IIFE](http://adripofjavascript.com/blog/drips/an-introduction-to-iffes-immediately-invoked-function-expressions.html) global, window.AS, for script users, and the AS/ dir of the modules for direct es6 native module implementations.

It can also be used as a CDN for all the es6 Modules:

* `import Model from` '[http://backspaces.github.io/CoreAS/dist/AS/Model.js](http://backspaces.github.io/CoreAS/dist/AS/Model.js)'

The es6 modules are also available as a single Rollup es6 Module bundle
* `import {ColorMap, Model, util} from` '[http://backspaces.github.io/CoreAS/dist/AS.module.js](http://backspaces.github.io/CoreAS/dist/AS.module.js)'

Finally, they are also available as a traditional legacy IIFE Rollup bundle:
* `<script src="`[http://backspaces.github.io/CoreAS/dist/AS.js](http://backspaces.github.io/CoreAS/dist/AS.js)`"></script>`


## Files

Our directory layout is:
```
bin: workflow scripts
dist: AS.js & AS.module.js bundles & AS/ es6 source.
docs: gh-page
src: es6 modules for AS
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
