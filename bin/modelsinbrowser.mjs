#!/usr/bin/env node

// const liveServer = require('live-server')
// const shell = require('shelljs')

// const esmImport = require('esm')(module)
// const liveServer = esmImport('live-server')
// const shell = esmImport('shelljs')
// const { timeoutPromise } from '../src/utils.js'

import liveServer from 'live-server'
import shell from 'shelljs'
// import { timeoutPromise } from '../src/utils.js'

function timeoutPromise(ms = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

// const dir = process.argv[2].replace(/\/$/, '') // remove optional final "/"
const dir = process.argv[2]
const browser = process.argv[3] || 'Google Chrome'
if (!dir) throw Error('Needs dir name argument')

console.log('dir:', dir, 'browser', browser)

liveServer.start({
    open: false,
    // logLevel: 0,
    // ignore: '*',
    port: 9090,
})
const root = 'http://127.0.0.1:9090'

const models = shell.ls(`${dir}/*.html`) // Just the Model files

models.forEach(model => shell.echo(model))
// shell.echo(models)
shell.exec(`open --new -a "${browser}" --args --new-window`)
await timeoutPromise(4000)

models.forEach(model => shell.exec(`open -a "${browser}" ${root}/${model}`))
