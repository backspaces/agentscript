// import { terser } from 'rollup-plugin-terser'
import terser from '@rollup/plugin-terser'
import cleanup from 'rollup-plugin-cleanup'

export default [
    // AS.js rollups, complete with 2D & 3D models
    {
        input: 'src/AS.js',
        output: {
            file: 'dist/agentscript.js',
            format: 'es',
        },
        plugins: [cleanup()],
    },
    {
        input: 'src/AS.js',
        output: {
            file: 'dist/agentscript.min.js',
            format: 'es',
        },
        plugins: [terser()],
    },
    {
        input: 'src/AS.js',
        output: {
            file: 'dist/agentscript.umd.js',
            format: 'umd',
            name: 'AS',
        },
        plugins: [cleanup()],
    },

    // AS0.js rollups, with 2D only
    {
        input: 'src/AS0.js',
        output: {
            file: 'dist/agentscript0.js',
            format: 'es',
        },
        plugins: [cleanup()],
    },
    {
        input: 'src/AS0.js',
        output: {
            file: 'dist/agentscript0.min.js',
            format: 'es',
        },
        plugins: [terser()],
    },
    {
        input: 'src/AS0.js',
        output: {
            file: 'dist/agentscript0.umd.js',
            format: 'umd',
            name: 'AS',
        },
        plugins: [cleanup()],
    },
]
