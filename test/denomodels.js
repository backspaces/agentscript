#!/usr/bin/env -S deno test -A --trace-ops --unstable
// if using hashbang, must be called from repo root:
//   test/denomodels.js
// if run from npm script, it will be run in repo root.
//   "denomodels": "deno test -A --unstable test/denomodels.js",
// or
//   "denomodels": "test/denomodels.js",
// to run from cli, from repo root:
//    deno test -A --unstable test/denomodels.js
// to debug:
//    deno test -A --unstable --inspect-brk test/denomodels.js

import * as util from '../src/utils.js'
import { assert } from 'https://deno.land/std@0.92.0/testing/asserts.ts'
import * as skiaCanvas from 'https://deno.land/x/skia_canvas@0.5.4/mod.ts'
console.log('skiaCanvas', Object.keys(skiaCanvas))

// make available to all models globally
const { Image, createCanvas } = skiaCanvas
Object.assign(globalThis, { Image, createCanvas })

let img = await util.imagePromise(
    'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/13/1555/3084.png'
)
console.log('img test', img)

// ------------------ init data ------------------

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

function nameToPath(name) {
    return import.meta.resolve('../models/' + name)
}
function shortName(name) {
    return name.replace('.js', '')
}

// ------------------ fetch model names ------------------

const p = await Deno.run({
    cmd: ['ls', '-1'],
    stdout: 'piped',
})
const ls = new TextDecoder().decode(await p.output()).split('\n')
const models = util
    .grep(ls, /^[A-Z].*js$/)
    .filter(name => !nonworkers.includes(name))
// .filter(name => name === 'CountiesModel.js')
// .filter(name => name === 'AvalancheModel.js')

console.log('models', models)

// ------------------ run models in main thread ------------------

async function runInMain(name) {
    const path = nameToPath(name)
    console.log('model path', path)
    const model = await util.runModel(path, 500, true)
    results[shortName(name)] = util.sampleModel(model)
}
for (const name of nonworkers) {
    runInMain(name)
}

// ------------------ run models in worker thread ------------------

let numResults = 0
const workerURL = new URL('./denoworker.js', import.meta.url).href
function runInWorker(name) {
    const path = nameToPath(name)
    console.log('main: name & path', name, path)

    const worker = new Worker(workerURL, { type: 'module' })
    worker.onmessage = e => {
        if (e.data === 'init') {
            console.log('main: worker init received, posting', name)
            worker.postMessage({ name, path })
        } else {
            const { name, result } = e.data
            results[shortName(name)] = result
            console.log('main: worker results', name, 'result', ++numResults)
        }
    }
}
for (const name of models) {
    runInWorker(name)
}
await util.waitUntilDone(() => numResults === models.length)

// ------------------ compare results ------------------

Deno.chdir('../' + testDir)
console.log('cwd', Deno.cwd())

const samples = await Deno.readTextFile('./samples.json')
const oldResults = JSON.parse(samples)
// console.log('oldResults now available')
for (const key of Object.keys(results)) {
    Deno.test(key, async () => {
        // console.log('testing', key)
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
