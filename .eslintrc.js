// .eslintrc.js
// Also see .prettierrc.js
module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module',
    },
    rules: {
        curly: ['error', 'multi-line', 'consistent'],
        'prefer-const': ['error'],
        'no-console': ['error', { allow: ['log', 'warn', 'error'] }],

        // Prettier prefers no space after function
        // 'space-before-function-paren': 'error',
        // 'space-before-function-paren': ['error', 'never'],

        // Here to match our Prettier options
        semi: ['error', 'never'],
        quotes: ['error', 'single'],
        indent: ['error', 4],
        'comma-dangle': ['error', 'always-multiline'],
        'arrow-parens': ['error', 'as-needed'],
    },
}
