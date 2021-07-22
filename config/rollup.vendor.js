// import { terser } from 'rollup-plugin-terser'
import urlResolve from 'rollup-plugin-url-resolve'
// import prettier from 'rollup-plugin-prettier'
import cleanup from 'rollup-plugin-cleanup'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
    {
        input: './config/turf.js',
        output: {
            file: 'vendor/turf.js',
            format: 'esm',
        },
        plugins: [urlResolve(), cleanup()],
        // plugins: [nodeResolve(), urlResolve(), cleanup()],
    },
    // (!) `this` has been rewritten to `undefined`
    // https://rollupjs.org/guide/en/#error-this-is-undefined
    // node_modules/@turf/random/dist/es/index.js
    // 1: var __spreadArrays = (this && this.__spreadArrays) || function () {
    // [!] Error: 'default' is not exported by node_modules/object-assign/index.js, imported by node_modules/@turf/isolines/dist/es/index.js
    // https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module
    // node_modules/@turf/isolines/dist/es/index.js (5:7)
    // After patching random: __spreadArrays isolines: objectAssign
    // I get lots of circular dependencies from d3-voronoi
    //     (!) Circular dependencies
    // node_modules/d3-voronoi/src/Diagram.js -> node_modules/d3-voronoi/src/Beach.js -> node_modules/d3-voronoi/src/Cell.js -> node_modules/d3-voronoi/src/Edge.js -> node_modules/d3-voronoi/src/Diagram.js
    // node_modules/d3-voronoi/src/Diagram.js -> node_modules/d3-voronoi/src/Beach.js -> node_modules/d3-voronoi/src/Cell.js -> node_modules/d3-voronoi/src/Diagram.js
    // node_modules/d3-voronoi/src/Diagram.js -> node_modules/d3-voronoi/src/Beach.js -> node_modules/d3-voronoi/src/Circle.js -> node_modules/d3-voronoi/src/Diagram.js
    // node_modules/d3-voronoi/src/Diagram.js -> node_modules/d3-voronoi/src/Beach.js -> node_modules/d3-voronoi/src/Diagram.js
    {
        // input: './node_modules/@turf/turf/turf.min.js',
        // input: './config/turf.all.js',
        input: './node_modules/@turf/turf/dist/es/index.js',
        output: {
            file: 'vendor/turf.all.js',
            format: 'esm',
        },
        plugins: [nodeResolve(), commonjs(), urlResolve(), cleanup()],
        // plugins: [commonjs(), cleanup()],
        // plugins: [urlResolve(), cleanup()],
        // plugins: [nodeResolve(), urlResolve(), cleanup()],
    },
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
