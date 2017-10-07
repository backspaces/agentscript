#!/usr/bin/env node

const fs = require('fs')
const json = JSON.parse(fs.readFileSync('package.json'))
// console.log(json)

// https://nodejs.org/docs/latest/api/process.html#process_process_argv
const key = process.argv[2]
if (!key) throw new Error('pkgkey called with no argument')
let val = json[key]
if (!val) throw new Error(`pkgkey: ${key} not found`)

if (Array.isArray(val)) val = val.join(' ')

// console.log(val)
process.stdout.write(val)

// https://docs.npmjs.com/misc/scripts#packagejson-vars
// Does not return arrays/objects, just strings.
// const pkgkey = `npm_package_${key}`
// const val = process.env[pkgkey]
// console.log(key, pkgkey, val)
