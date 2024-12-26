// Note: Warning: To load an ES module, set "type": "module"
// in the package.json or use the .mjs extension.

// import { terser } from 'rollup-plugin-terser'
import terser from '@rollup/plugin-terser'
import cleanup from 'rollup-plugin-cleanup'

export default [
    // AS3D.js rollups, complete with 2D & 3D models
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
    // {
    //     input: 'src/AS.js',
    //     output: {
    //         file: 'dist/agentscript.umd.js',
    //         format: 'iife', // Immediately invoked function expression
    //         name: 'AS', // window will have AS an the individual classes/objects
    //         footer: `
    //     (function(exports) {
    //         Object.assign(window, exports); // Explicitly use window
    //     })(AS); // Pass the exported object to the function
    //     `,
    //     },
    //     plugins: [cleanup()],
    // },
    {
        input: 'src/AS.js',
        output: {
            file: 'dist/agentscript.umd.js',
            format: 'umd',
            name: 'AS',
        },
        plugins: [cleanup()],
    },

    // AS.js rollups, with 2D only
    {
        input: 'src/AS2D.js',
        output: {
            file: 'dist/agentscript2d.js',
            format: 'es',
        },
        plugins: [cleanup()],
    },
    {
        input: 'src/AS2D.js',
        output: {
            file: 'dist/agentscript2d.min.js',
            format: 'es',
        },
        plugins: [terser()],
    },
    // {
    //     input: 'src/AS2D.js',
    //     output: {
    //         file: 'dist/agentscript2d.umd.js',
    //         format: 'iife', // Immediately invoked function expression
    //         name: 'AS', // window will have AS an the individual classes/objects
    //         footer: `
    //     (function(exports) {
    //         Object.assign(window, exports); // Explicitly use window
    //     })(AS); // Pass the exported object to the function
    //     `,
    //     },
    //     plugins: [cleanup()],
    // },
    {
        input: 'src/AS2D.js',
        output: {
            file: 'dist/agentscript2d.umd.js',
            format: 'umd',
            name: 'AS',
        },
        plugins: [cleanup()],
    },
]
