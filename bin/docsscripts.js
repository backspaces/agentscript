#!/usr/bin/env node
const shell = require('shelljs')

shell.cd('./docs/models')

// const paths = shell.ls('[A-Z].*.js')
const models = shell.ls('[A-Z]*Model.js')

models.forEach(model => {
    const script = model.replace('Model', 'Script')
    shell.echo(model, '->', script)
    shell.cp(model, script)
    shell.sed('-i', /^import {/, 'const {', script)
    shell.sed('-i', /} from .*js'/, '} = AS', script)
    shell.sed('-i', 'export default class', 'class', script)
})
