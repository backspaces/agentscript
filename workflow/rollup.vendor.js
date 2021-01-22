// import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
// import copy from 'rollup-plugin-copy'
// import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
    // {
    //     input: 'node_modules/@firebase/app/dist/index.esm.js',
    //     output: {
    //         file: 'vendor/firebase-app.esm.js',
    //         format: 'esm',
    //     },
    //     plugins: [nodeResolve()],
    // },
    // {
    //     input: 'node_modules/@firebase/database/dist/index.esm.js',
    //     output: {
    //         file: 'vendor/firebase-database.esm.js',
    //         format: 'esm',
    //     },
    //     plugins: [nodeResolve()],
    // },
    // {
    //     input: 'node_modules/@firebase/database/dist/index.esm.js',
    //     output: {
    //         file: 'vendor/firebase-database.min.js',
    //         format: 'esm',
    //     },
    //     plugins: [terser(), nodeResolve()],
    // },
    {
        input: 'workflow/three.index.js',
        output: {
            file: 'vendor/three.esm.min.js',
            format: 'esm',
            banner: '/* eslint-disable */',
        },
        plugins: [terser()],
    },
    {
        input: 'workflow/three.index.js',
        output: {
            file: 'vendor/three.esm.js',
            format: 'esm',
            banner: '/* eslint-disable */',
        },
    },
    {
        input: 'node_modules/three/src/core/Object3D.js',
        output: {
            file: 'vendor/Object3D.esm.min.js',
            format: 'esm',
            banner: '/* eslint-disable */',
        },
        plugins: [terser()],
    },
    {
        input: 'node_modules/three/src/core/Object3D.js',
        output: {
            file: 'vendor/Object3D.esm.js',
            format: 'esm',
            banner: '/* eslint-disable */',
        },
    },
    // {
    //     input: 'node_modules/dat.gui/build/dat.gui.module.js',
    //     output: {
    //         file: 'vendor/dat.gui.esm.min.js',
    //         format: 'esm',
    //         banner: '/* eslint-disable */',
    //     },
    //     plugins: [
    //         terser(),
    //         copy({
    //             targets: [
    //                 {
    //                     src: 'node_modules/dat.gui/build/dat.gui.module.js',
    //                     dest: 'vendor',
    //                     rename: 'dat.gui.esm.js',
    //                 },
    //             ],
    //         }),
    //     ],
    // },
    // {
    //     input: 'node_modules/chart.js/dist/Chart.bundle.js',
    //     output: {
    //         file: 'vendor/chart.esm.min.js',
    //         format: 'esm',
    //     },
    //     plugins: [terser(), commonjs()],
    // },
    // {
    //     input: 'node_modules/chart.js/dist/Chart.bundle.js',
    //     output: {
    //         file: 'vendor/chart.esm.js',
    //         format: 'esm',
    //     },
    //     plugins: [commonjs()],
    // },
    // {
    //     input: 'node_modules/mapbox-gl/dist/mapbox-gl-unminified.js',
    //     output: {
    //         file: 'vendor/mapbox-gl.esm.js',
    //         format: 'esm',
    //     },
    //     plugins: [commonjs()],
    // },
    // {
    //     input: 'node_modules/mapbox-gl/dist/mapbox-gl-unminified.js',
    //     output: {
    //         file: 'vendor/mapbox-gl.esm.min.js',
    //         format: 'esm',
    //     },
    //     plugins: [terser(), commonjs()],
    // },
    // {
    //     input: 'node_modules/@turf/turf/turf.es.js',
    //     output: {
    //         file: 'vendor/turf.esm.min.js',
    //         format: 'esm',
    //         banner: '/* eslint-disable */',
    //     },
    //     plugins: [
    //         terser(),
    //         copy({
    //             targets: [
    //                 {
    //                     src: 'node_modules/@turf/turf/turf.es.js',
    //                     dest: 'vendor',
    //                     rename: 'turf.esm.js',
    //                 },
    //             ],
    //         }),
    //     ],
    // },
]
