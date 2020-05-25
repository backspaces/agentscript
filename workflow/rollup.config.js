import { terser } from 'rollup-plugin-terser'

export default [
    {
        input: 'src/AS.js',
        output: [
            {
                file: 'dist/agentscript.umd.min.js',
                format: 'umd',
                name: 'AS',
                banner: '/* eslint-disable */',
            },
            {
                file: 'dist/agentscript.esm.min.js',
                format: 'es',
                banner: '/* eslint-disable */',
            },
        ],
        plugins: [terser()],
    },
    {
        input: 'src/AS.js',
        output: [
            {
                file: 'dist/agentscript.umd.js',
                format: 'umd',
                name: 'AS',
                banner: '/* eslint-disable */',
            },
            {
                file: 'dist/agentscript.esm.js',
                format: 'es',
                banner: '/* eslint-disable */',
            },
        ],
    },
]
