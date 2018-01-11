// https://stackoverflow.com/a/8808162/1791917
const vm = require('vm')
const fs = require('fs')
module.exports = function (path, context = {}) {
  const data = fs.readFileSync(path)
  vm.runInNewContext(data, context)
  return context
}
