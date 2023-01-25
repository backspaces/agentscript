// Note: Warning: To load an ES module, set "type": "module"
// in the package.json or use the .mjs extension.

import terser from '@rollup/plugin-terser'
// import { terser } from 'rollup-plugin-terser'
import cleanup from 'rollup-plugin-cleanup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
// import resolve from 'rollup-plugin-node-resolve'

export default [
    {
        input: 'config/turfImports.js',
        output: {
            file: 'vendor/turfImports.js',
            format: 'esm',
        },
        plugins: [nodeResolve(), cleanup()],
        // plugins: [resolve(), cleanup()],
    },

    {
        input: 'config/turfImports.js',
        output: {
            file: 'vendor/turfImports.min.js',
            format: 'esm',
        },
        plugins: [nodeResolve(), terser()],
        // plugins: [resolve(), terser()],
    },

    // three.all.js = THREE & OrbitControls
    {
        input: './config/three.all.js',
        output: {
            file: 'vendor/three.js',
            format: 'esm',
        },
        plugins: [cleanup()],
    },

    {
        input: './config/three.all.js',
        output: {
            file: 'vendor/three.min.js',
            format: 'esm',
        },
        plugins: [terser()],
    },

    // Object3D.js = THREE's geometry mathematics, used by Model
    {
        input: 'node_modules/three/src/core/Object3D.js',
        output: {
            file: 'vendor/Object3D.js',
            format: 'esm',
        },
        plugins: [cleanup()],
    },

    {
        input: 'node_modules/three/src/core/Object3D.js',
        output: {
            file: 'vendor/Object3D.min.js',
            format: 'esm',
        },
        plugins: [terser()],
    },

    // stats.js and dat.gui.js are included in THREE, so we use them
    {
        input: 'node_modules/three/examples/jsm/libs/stats.module.js',
        output: {
            file: 'vendor/stats.js',
            format: 'esm',
        },
        plugins: [cleanup()],
    },

    {
        input: 'node_modules/three/examples/jsm/libs/dat.gui.module.js',
        output: {
            file: 'vendor/dat.gui.js',
            format: 'esm',
        },
        plugins: [cleanup()],
    },

    {
        input: 'node_modules/three/examples/jsm/libs/dat.gui.module.js',
        output: {
            file: 'vendor/dat.gui.min.js',
            format: 'esm',
        },
        plugins: [terser()],
    },
]
