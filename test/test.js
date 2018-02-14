/* eslint-disable */
import test from 'ava'

// Two ways to import AS:
// 1 - Use bin/execfile to import vanilla JS: https://goo.gl/sQp7jn
// 2 - Use the AS.cjs CommonJS rollup

// const execFile = require('../bin/execfile')
// const AS = execFile('./dist/AS.js').AS
const AS = require('../dist/AS.js')

// Place all modules in global space.
//    Object.assign(this, AS)
// won't work, no global space for ava
Object.assign(global, AS)

// console.log('this', typeof this)
// console.log('global', Object.keys(global))
// console.log('AgentArray', util.typeOf(AgentArray))

test('foo', t => {
  t.is(2, 2)
})

test('AS', t => {
  t.is(util.typeOf({}), 'object')
})
