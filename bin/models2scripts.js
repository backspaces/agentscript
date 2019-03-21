#!/usr/bin/env node
const shell = require('shelljs')

shell.cd('./models')

const models = shell.ls('[A-Z]*Model.js')

models.forEach(model => {
    let script = model.replace('Model', 'Script')
    script = `../tests/modelScripts/${script}`
    shell.echo(model, '->', script)
    shell.cp(model, script)
    shell.sed('-i', 'export default class', 'class', script)
    shell.sed('-i', /^import (\w+) .*$/, 'const $1 = AS.$1', script)
})
