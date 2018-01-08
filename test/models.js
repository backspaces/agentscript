/* eslint-disable */
import test from 'ava'

const vm = require('vm')
const fs = require('fs')

const AS = require('../dist/AS.cjs')

// const models = {}
// const modelPaths =
//   fs.readdirSync('./models')
//   .map((fileName) => 'models/' + fileName)
//   .filter((fileName) => fileName.endsWith('.js'))
//
// modelPaths.forEach(file => {
//   const str = fs.readFileSync(file, 'utf8')
//   models[file] = str.replace(/^import.*$/mg,'')
// })

// const models =
//   fs.readdirSync('./models')
//   .map((fileName) => 'models/' + fileName)
//   .filter((fileName) => fileName.endsWith('.js'))
//   .reduce((obj, fileName) => {
//     const str = fs.readFileSync(fileName, 'utf8')
//     obj[fileName] = str.replace(/^import.*$/mg,'')
//     return obj
//   }, {})

// const shell = require('shelljs')
// shell.ls('models/*.js').forEach(file => {
//   const str = shell.cat(file)
//   models[file] = str.replace(/^import.*$/mg,'')
// })

const shell = require('shelljs')
const models = {}
shell.ls('models/*.js').forEach(file => {
  models[file] = shell.cat(file)
    .sed(/^import.*$/mg,'')
    .sed(/^ *util.toWindow.*$/mg,'')
})

AS.util.forEach(models, (val, key) => {
  test(key, t => {
    console.log('====', key)
    const ctx = vm.createContext({})
    Object.assign(ctx, AS)
    vm.runInNewContext(val, ctx)
    t.pass()
  })
})
