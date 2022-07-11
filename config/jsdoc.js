'use strict'

module.exports = {
    plugins: ['plugins/markdown'],
    source: {
        include: 'src/',
        includePattern: '.+\\.js$',
    },
    opts: {
        destination: 'docs/',
        readme: './README.md',
        template: './node_modules/clean-jsdoc-theme',
        tutorials: "./tutorials",
        theme_opts: {
            default_theme: 'light',
            title: 'AgentScript',
            menu: [
                {
                    title: 'GitHub',
                    link: 'https://github.com/backspaces/agentscript',
                    target: '_blank',
                    id: 'github',
                },
                {
                    title: 'npm',
                    link: 'https://www.npmjs.com/package/agentscript',
                    target: '_blank',
                    id: 'npm',
                },
            ],
        },
    },
    markdown: {
        idInHeadings: true,
    },
}
