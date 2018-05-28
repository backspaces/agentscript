#!/usr/bin/env node

const shell = require('shelljs')

const paths = shell.ls('models/*.js')

paths.forEach(path => {
    // First create a comma separated list of module names for this path
    const importNames = shell
        .grep(/^import.*from '\./, path) // get model's import statements
        .sed(/\* as /, '') // import * as foo => import foo
        .sed(/^import */, '') // get the name of the import
        .sed(/ .*$/, ',')
        .replace(/\n/g, ' ') // join the multiple names
        .replace(/, *$/, '') // remove final comma

    shell.echo('=====', `${path}: ${importNames}`)

    // Make the one-liner import
    const imports = `import {${importNames}} from '../dist/agentscript.esm.js'`

    // Replace multiple imports with single import.
    // Write results to docs/path
    const code = shell.grep('-v', /^import.*from '\./, path)
    shell
        .ShellString(
            `
${imports}
${code}
`
        )
        .to(`docs/${path}`)
})

shell.cp('models/*.html', 'docs/models')
