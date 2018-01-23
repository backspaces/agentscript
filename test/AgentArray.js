/* eslint-disable */
import test from 'ava'

// Two ways to import AS:
// 1 - Use bin/execfile to import vanilla JS: https://goo.gl/sQp7jn
const execFile = require('../bin/execfile')
const AS = execFile('./dist/AS.js').AS
// 2 - Use the AS.cjs CommonJS rollup
// const AS = require('../dist/AS.cjs')

// Place all modules in global space.
//    Object.assign(this, AS)
// won't work, no global space for ava
Object.assign(global, AS)


test('fromArray', t => {
  const aa = AgentArray.fromArray([1, 2, 3])
  console.log(aa.oneOf())
  t.is(util.typeName(aa), 'AgentArray')
})

test('AS', t => {
  t.is(util.typeOf({}), 'object')
})

test('randomSeedParkMiller 1% diff', t => {
  const a = new AgentArray()
  const random = util.randomSeedParkMiller()
  util.repeat(1e6, () => a.push(random()))
  const hist = a.histogram()
  const max = hist.max()
  const min = hist.min()
  const mean = (max + min) / 2
  const percentDifference = (max - min) / mean
  // console.log('percentDifference', percentDifference)
  t.true(percentDifference < .01) // 1 percent difference
})

test('randomSeedSin 3% diff', t => {
  const a = new AgentArray()
  const random = util.randomSeedSin()
  util.repeat(1e6, () => a.push(random()))
  const hist = a.histogram()
  const max = hist.max()
  const min = hist.min()
  const mean = (max + min) / 2
  const percentDifference = (max - min) / mean
  // console.log('percentDifference', percentDifference)
  t.true(percentDifference < .03) // 3 percent difference
})
