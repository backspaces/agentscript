/* eslint-disable */
import test from 'ava'
console.log('ava', typeof setTimeout, typeof window, typeof global)


const vm = require('vm')
// const fs = require('fs')
// const AS = require('../dist/AS.cjs')
const AS = require('../dist/agentscript.umd.js')

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

// Inject elevation dataset into droplets
if (models.droplets) {
  const elevation = shell.cat('test/elevation.json')
  // const elevation = JSON.parse(shell.cat('test/elevation.json'))
  models.droplets = `
    elevationJson = ${elevation}
    ${models.droplets}
  `; null
}

test('foo', t => {
  t.is(2, 2)
})


// Run the modified code in isolated contexts.
// Add AS & our models object to the context.
// Store the result (model variable) in the models global.
AS.util.forEach(models, (val, key) => {
  console.log('====', key)
  const ctx = vm.createContext({})
  Object.assign(ctx, global)
  ctx.models = models
  Object.assign(ctx, AS)
  vm.runInNewContext(val, ctx)

  // console.log('====', key)
  // const script = new vm.Script(val)
  // global.models = models
  // Object.assign(global, AS)
  // script.runInThisContext()
})

// Run tests on the model objects
AS.util.forEach(models, (val, key) => {
  test(key, t => {
    const model = models[key]
    const testFcn = tests[key]
    // if (testFcn) console.log(key, testFcn, testFcn(model))
    if (testFcn)
      t.true(testFcn(model))
      // t.truthy(model.patches)
    else
      t.truthy(model.patches)
  })
})

function xyIs (t, x, y) {
  return t.x === x && t.y === y
}
const tests = {
  diffuse: model =>
    xyIs(model.turtles[0], -55.12883742162845, 26.653802018711236),
  droplets: model => model.turtlesOnLocalMins() === 4767,
  exit: model => model.turtles.length === 9,
  fire: model => model.initialTrees === 37685 && model.burnedTrees === 24986,
  flock: model => model.flockVectorSize() === 0.9161073651430817,
  hello: model =>
    xyIs(model.turtles[0], -6.5155131960118275, 9.679021938061352),
  links: model => model.links.length === 709,
  turtles: model =>
    xyIs(model.turtles[0], 7.468670117052284, 0.40421859847959674),
}
