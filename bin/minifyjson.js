#!/usr/bin/env node

const process = require('process')
const gis = require('./gis.umd.js')

let data = ''
process.stdin.on('readable', () => {
    while ((chunk = process.stdin.read()) !== null) {
        data += chunk
    }
})

process.stdin.on('end', () => {
    process.stdout.write(processData(data))
})

function processData(data) {
    return gis.minify(data)
}
