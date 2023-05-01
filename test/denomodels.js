#!/usr/bin/env -S deno test -A
// if using hashbang, must be called from repo root:
//   test/denomodels.js
// if run from npm script, it will be run in repo root.
//   "denomodels": "deno test -A test/denomodels.js",
// or
//   "denomodels": "test/denomodels.js",
// to run from cli, from repo root:
//    deno test -A test/denomodels.js

import * as util from '../src/utils.js'
import { assert } from 'https://deno.land/std@0.92.0/testing/asserts.ts'
import {
    createCanvas,
    loadImage,
} from 'https://deno.land/x/canvas@v1.4.1/mod.ts'
Object.assign(globalThis, { createCanvas, loadImage })

const modelsDir = 'models/'
const testDir = 'test/'
const results = {}
const nonworkers = JSON.parse(
    await Deno.readTextFile(testDir + 'nonworkers.json')
)
console.log('nonworkers:', nonworkers)

console.log('cwd', Deno.cwd())
Deno.chdir(modelsDir)
console.log('cwd', Deno.cwd())

const p = await Deno.run({
    cmd: ['ls', '-1'],
    stdout: 'piped',
})
const ls = new TextDecoder().decode(await p.output()).split('\n')
const models = util.grep(ls, /^[A-Z].*js$/)
// .filter(name => !nonworkers.includes(name))
// .filter(name => name !== 'Avalanche.js')
console.log('models', models)

// // // run all nonworkers in main thread
// // // for (const name of models) {
// for (const name of nonworkers) {
//     // const path = import.meta.resolve('./' + name)
//     const path = import.meta.resolve('../models/' + name)
//     console.log(path)
//     const model = await util.runModel(path, 500, true)
//     results[name.replace('.js', '')] = util.sampleModel(model)
// }
// // console.log('done: results', results)

// run each model in their own worker
let numResults = 0
const workerURL = new URL('./denoworker.js', import.meta.url).href
for (const name of models) {
    const worker = new Worker(workerURL, {
        type: 'module',
    })
    const path = import.meta.resolve('../models/' + name)

    worker.postMessage({ name, path })
    worker.onmessage = e => {
        const { name, result } = e.data
        results[name.replace('.js', '')] = result
        console.log(name, 'result', numResults++)
    }
}
await util.waitUntilDone(() => numResults === models.length - 1)

Deno.chdir('../' + testDir)
console.log('cwd', Deno.cwd())

const oldResults = JSON.parse(await Deno.readTextFile('./samples.json'))
for (const key of Object.keys(results)) {
    Deno.test(key, () => {
        if (!oldResults[key]) {
            console.log(key, 'is missing in prior results. A new model?')
            assert(true)
        } else {
            const areEqual = util.objectsEqual(results[key], oldResults[key])
            assert(areEqual)
        }
    })
}

await Deno.writeTextFile('./samples.json', JSON.stringify(results, null, 2))
