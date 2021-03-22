// import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
// import copy from 'rollup-plugin-copy'
// import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
    // {
    //     input: 'config/three.index.js',
    //     output: {
    //         file: 'dist/three.esm.min.js',
    //         format: 'esm',
    //         banner: '/* eslint-disable */',
    //     },
    //     plugins: [terser()],
    // },
    // {
    //     input: 'config/three.index.js',
    //     output: {
    //         file: 'dist/three.esm.js',
    //         format: 'esm',
    //         banner: '/* eslint-disable */',
    //     },
    // },
    {
        input: 'node_modules/three/src/core/Object3D.js',
        output: {
            file: 'dist/Object3D.esm.min.js',
            format: 'esm',
            banner: '/* eslint-disable */',
        },
        plugins: [terser()],
    },
    {
        input: 'node_modules/three/src/core/Object3D.js',
        output: {
            file: 'dist/Object3D.esm.js',
            format: 'esm',
            banner: '/* eslint-disable */',
        },
    },
]
