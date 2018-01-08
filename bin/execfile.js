var vm = require('vm')
var fs = require('fs')
module.exports = function (path, context = {}) {
  var data = fs.readFileSync(path)
  vm.runInNewContext(data, context)
  return context
}
