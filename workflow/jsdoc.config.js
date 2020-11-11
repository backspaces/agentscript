'use strict'

module.exports = {
    // source: {
    //     includePattern: './src/*.js',
    // },
    opts: {
        destination: './docs/',
        readme: './src/README.md',
    },
    templates: {
        default: {
            includeDate: false,
        },
    },
    plugins: ['plugins/markdown'],
}
