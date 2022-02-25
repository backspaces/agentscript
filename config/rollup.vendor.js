import { terser } from 'rollup-plugin-terser'
import cleanup from 'rollup-plugin-cleanup'

export default [
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

    {
        input: 'node_modules/three/src/core/Object3D.js',
        output: {
            file: 'vendor/Object3D.js',
            format: 'esm',
        },
        plugins: [cleanup()],
    },
]
