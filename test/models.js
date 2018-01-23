/* eslint-disable */
import test from 'ava'

const vm = require('vm')
const fs = require('fs')
const AS = require('../dist/AS.cjs')
const shell = require('shelljs')

// Global used for all the models source and their resulting model.
const models = {}

// Modify the models/*.js source to run in node.
// models.foo = the modified code for models/foo.js
shell.ls('models/*.js').forEach(file => {
  const name = file.replace(/^models./, '').replace(/.js$/, '')
  let code = shell.cat(file)
    .sed(/^import.*$/,'')
    .sed(/^ *util.toWindow.*$/,'')
  code = `
    util.randomSeed()
    ${code}
    models.${name} = model
  `
  models[name] = code
})

// Run the modified code in isolated contexts.
// Add AS & our models object to the context.
// Store the result (model variable) in the models global.
AS.util.forEach(models, (val, key) => {
  console.log('====', key)
  const ctx = vm.createContext({})
  ctx.models = models
  Object.assign(ctx, AS)
  vm.runInNewContext(val, ctx)
})

// Run tests on the model objects
AS.util.forEach(models, (val, key) => {
  test(key, t => {
    const model = models[key]
    const testFcn = tests[key]
    // if (testFcn) console.log(key, testFcn, testFcn(model))
    if (testFcn)
      t.true(testFcn(model))
    else
      t.truthy(model.patches)
  })
})

const tests = {
  fire: (model) => model.initialTrees === 37685 && model.burnedTrees === 24986,
  flock: (model) => model.flockVectorSize() === 0.9161073651430817,
  exit: (model) => model.turtles.length === 9,
  links: (model) => model.links.length === 715,
}
