// import commonjs from 'rollup-plugin-commonjs'
// import { terser } from 'rollup-plugin-terser'
// import copy from 'rollup-plugin-copy'
// import { nodeResolve } from '@rollup/plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'

export default [
    {
        input: './config/three.all.js',
        output: {
            file: 'vendor/three.js',
            format: 'esm',
            // banner: '/* eslint-disable */',
        },
        plugins: [cleanup()],
    },
    {
        input: 'node_modules/three/src/core/Object3D.js',
        output: {
            file: 'vendor/Object3D.js',
            format: 'esm',
            // banner: '/* eslint-disable */',
        },
        plugins: [cleanup()],
    },
    // {
    //     input: './tests/steganography.js',
    //     output: {
    //         file: 'vendor/steganography.esm.js',
    //         format: 'esm',
    //         // banner: '/* eslint-disable */',
    //     },
    //     plugins: [cleanup()],
    // },

    // {
    //     input: './node_modules/three/build/three.module.js',
    //     output: {
    //         file: 'vendor/three.js',
    //         format: 'esm',
    //         // banner: '/* eslint-disable */',
    //     },
    //     plugins: [copy()],
    // },
    // {
    //     input: './node_modules/three/build/three.module.js',
    //     output: {
    //         file: 'vendor/three.min.js',
    //         format: 'esm',
    //         // banner: '/* eslint-disable */',
    //     },
    //     plugins: [copy(), terser()],
    // },

    // {
    //     input: './node_modules/three/examples/jsm/controls/OrbitControls.js',
    //     output: {
    //         file: 'vendor/OrbitControls.js',
    //         format: 'esm',
    //         // banner: '/* eslint-disable */',
    //     },
    //     // plugins: [copy()],
    // },
    // {
    //     input: './node_modules/three/examples/jsm/controls/OrbitControls.js',
    //     output: {
    //         file: 'vendor/OrbitControls.min.js',
    //         format: 'esm',
    //         // banner: '/* eslint-disable */',
    //     },
    //     plugins: [copy(), terser()],
    // },

    // {
    //     input: 'node_modules/three/src/core/Object3D.js',
    //     output: {
    //         file: 'vendor/Object3D.min.js',
    //         format: 'esm',
    //         // banner: '/* eslint-disable */',
    //     },
    //     plugins: [terser()],
    // },
]
