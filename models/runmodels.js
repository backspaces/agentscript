#!/usr/bin/env -S deno run -A
// deno run -A models/runmodels.js

import * as util from '../src/utils.js'
const modelsDir = 'models/'

Deno.chdir(modelsDir)
// console.log('cwd', Deno.cwd())

const p = await Deno.run({
    // cmd: ['ls', '-1', modelsDir],
    cmd: ['ls', '-1'],
    stdout: 'piped',
})
const ls = new TextDecoder().decode(await p.output()).split('\n')

console.log('ls', ls, util.typeOf(ls), ls.length)

const models = util.grep(ls, /^[A-Z].*js$/)
// const models = ['CountiesModel.js']

console.log('reduce', models, models.length)

for (const name of models) {
    const path = import.meta.resolve('./' + name)
    console.log(path)
    // const Model = (await import(path)).default
    // const model = new Model()
    await util.runModel(path, 500)
}
