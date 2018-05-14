// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: 'standard',
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    curly: [0],
    'prefer-const': [2],
    indent: ['error', 2]
  }
}
