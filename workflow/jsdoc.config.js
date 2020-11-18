'use strict'

module.exports = {
    source: {
        // include: ['./src', './tutorials'],
        include: ['./src'],
        includePattern: '.*.js',
    },
    opts: {
        destination: './docs/',
        readme: './src/README.md',
        tutorials: './tutorials',
        template: './node_modules/clean-jsdoc-theme',
        theme_opts: {
            theme: 'light', // dark or light
        },
    },
    templates: {
        default: {
            includeDate: false,
        },
    },
    plugins: ['plugins/markdown'],
}
