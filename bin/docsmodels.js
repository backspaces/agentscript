#!/usr/bin/env node
const shell = require('shelljs')

const paths = shell.ls('models/*.js')

paths.forEach(path => {
    // First create a comma separated list of module names for this path
    const importNames = shell
        .grep(/^import.*from '\.\.\/src/, path) // get model's ../src import statements
        .sed(/\* as /, '') // import * as foo => import foo
        .sed(/^import */, '') // get the name of the import
        .sed(/ .*$/, ',')
        .replace(/\n/g, ' ') // join the multiple names
        .replace(/, *$/, '') // remove final comma

    shell.echo('=====', `${path}: ${importNames}`)

    // Make the one-liner import
    const imports = `import {${importNames}} from '../dist/agentscript.esm.min.js'`

    // Replace multiple imports with single import.
    // Write results to docs/path
    const code = shell.grep('-v', /^import.*from '\.\.\/src/, path)
    shell.ShellString(`${imports}\n${code}`).to(`docs/${path}`)
})

shell.cp('models/*.html', 'docs/models')
