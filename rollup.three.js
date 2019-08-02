import { terser } from 'rollup-plugin-terser'

export default {
    input: './three.index.js',
    output: {
        file: 'dist/three.esm.js',
        format: 'es',
        banner: '/* eslint-disable */',
    },
    plugins: [terser()],
}
