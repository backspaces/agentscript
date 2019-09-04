import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'

export default [
    {
        input: 'three.index.js',
        output: {
            file: 'dist/three.esm.min.js',
            format: 'es',
            banner: '/* eslint-disable */',
        },
        plugins: [terser()],
    },
    {
        input: 'three.index.js',
        output: {
            file: 'dist/three.esm.js',
            format: 'es',
            banner: '/* eslint-disable */',
        },
    },
    {
        input: 'node_modules/dat.gui/build/dat.gui.module.js',
        output: {
            file: 'dist/dat.gui.esm.min.js',
            format: 'es',
            banner: '/* eslint-disable */',
        },
        plugins: [
            terser(),
            copy({
                targets: [
                    {
                        src: 'node_modules/dat.gui/build/dat.gui.module.js',
                        dest: 'dist',
                        rename: 'dat.gui.esm.js',
                    },
                ],
            }),
        ],
    },
    {
        input: 'node_modules/chart.js/dist/Chart.bundle.js',
        output: {
            file: 'dist/chart.esm.min.js',
            format: 'esm',
        },
        plugins: [terser(), commonjs()],
    },
    {
        input: 'node_modules/chart.js/dist/Chart.bundle.js',
        output: {
            file: 'dist/chart.esm.js',
            format: 'esm',
        },
        plugins: [commonjs()],
    },
]
