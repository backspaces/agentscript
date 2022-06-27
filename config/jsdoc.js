'use strict'

module.exports = {
    plugins: ['plugins/markdown'],
    source: {
        include: 'src/',
        includePattern: '.+\\.js$',
    },
    opts: {
        destination: 'docs/',
    },
}
