/* eslint-disable */
import test from 'ava'

// Two ways to import AS:
// 1 - Use execfile to import any vanilla JS: https://goo.gl/FHr5Wt
// 2 - Use the AS.cjs CommonJS rollup

const execFile = require('../bin/execfile')
const AS = execFile('./dist/AS.js').AS
// const AS = require('../dist/AS.cjs')

// Place all modules in global space.
//    Object.assign(this, AS)
// won't work, no global space for ava
Object.assign(global, AS)

test('foo', t => {
  t.is(2, 2)
})

test('AS', t => {
  t.is(util.typeOf({}), 'object')
})
