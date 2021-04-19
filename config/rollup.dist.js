// import { terser } from 'rollup-plugin-terser'
import cleanup from 'rollup-plugin-cleanup'

export default [
    // {
    //     input: 'src/AS.js',
    //     output: [
    //         {
    //             file: 'dist/agentscript.umd.min.js',
    //             format: 'umd',
    //             name: 'AS',
    //             banner: '/* eslint-disable */',
    //         },
    //         {
    //             file: 'dist/agentscript.esm.min.js',
    //             format: 'es',
    //             banner: '/* eslint-disable */',
    //         },
    //     ],
    //     plugins: [terser()],
    // },
    {
        input: 'src/AS.js',
        output: [
            {
                file: 'dist/agentscript.umd.js',
                format: 'umd',
                name: 'AS',
                // banner: '/* eslint-disable */',
            },
            {
                file: 'dist/agentscript.js',
                format: 'es',
                // banner: '/* eslint-disable */',
            },
        ],
        plugins: [cleanup()],
    },
]
