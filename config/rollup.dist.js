import { terser } from 'rollup-plugin-terser'
import cleanup from 'rollup-plugin-cleanup'

export default [
    {
        input: 'src/AS.js',
        output: [
            // {
            //     file: 'dist/agentscript.umd.min.js',
            //     format: 'umd',
            //     name: 'AS',
            // },
            {
                file: 'dist/agentscript.min.js',
                format: 'es',
            },
        ],
        plugins: [terser()],
        external: ['https://cdn.skypack.dev/stats.js'],
    },
    {
        input: 'src/AS.js',
        output: [
            {
                file: 'dist/agentscript.umd.js',
                format: 'umd',
                name: 'AS',
            },
            {
                file: 'dist/agentscript.js',
                format: 'es',
            },
        ],
        plugins: [cleanup()],
        external: ['https://cdn.skypack.dev/stats.js'],
    },
]
