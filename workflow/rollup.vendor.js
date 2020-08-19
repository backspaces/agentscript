import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'

export default [
    {
        input: 'workflow/three.index.js',
        output: {
            file: 'vendor/three.esm.min.js',
            format: 'es',
            banner: '/* eslint-disable */',
        },
        plugins: [terser()],
    },
    {
        input: 'workflow/three.index.js',
        output: {
            file: 'vendor/three.esm.js',
            format: 'es',
            banner: '/* eslint-disable */',
        },
    },
    {
        input: 'node_modules/three/src/core/Object3D.js',
        output: {
            file: 'vendor/Object3D.esm.min.js',
            format: 'es',
            banner: '/* eslint-disable */',
        },
        plugins: [terser()],
    },
    {
        input: 'node_modules/three/src/core/Object3D.js',
        output: {
            file: 'vendor/Object3D.esm.js',
            format: 'es',
            banner: '/* eslint-disable */',
        },
    },
    {
        input: 'node_modules/dat.gui/build/dat.gui.module.js',
        output: {
            file: 'vendor/dat.gui.esm.min.js',
            format: 'es',
            banner: '/* eslint-disable */',
        },
        plugins: [
            terser(),
            copy({
                targets: [
                    {
                        src: 'node_modules/dat.gui/build/dat.gui.module.js',
                        dest: 'vendor',
                        rename: 'dat.gui.esm.js',
                    },
                ],
            }),
        ],
    },
    {
        input: 'node_modules/chart.js/dist/Chart.bundle.js',
        output: {
            file: 'vendor/chart.esm.min.js',
            format: 'esm',
        },
        plugins: [terser(), commonjs()],
    },
    {
        input: 'node_modules/chart.js/dist/Chart.bundle.js',
        output: {
            file: 'vendor/chart.esm.js',
            format: 'esm',
        },
        plugins: [commonjs()],
    },
    {
        input: 'node_modules/mapbox-gl/dist/mapbox-gl-unminified.js',
        output: {
            file: 'vendor/mapbox-gl.esm.js',
            format: 'esm',
        },
        plugins: [commonjs()],
    },
    {
        input: 'node_modules/mapbox-gl/dist/mapbox-gl-unminified.js',
        output: {
            file: 'vendor/mapbox-gl.esm.min.js',
            format: 'esm',
        },
        plugins: [terser(), commonjs()],
    },
    {
        input: 'node_modules/@turf/turf/turf.es.js',
        output: {
            file: 'vendor/turf.esm.min.js',
            format: 'es',
            banner: '/* eslint-disable */',
        },
        plugins: [
            terser(),
            copy({
                targets: [
                    {
                        src: 'node_modules/@turf/turf/turf.es.js',
                        dest: 'vendor',
                        rename: 'turf.esm.js',
                    },
                ],
            }),
        ],
    },
]
