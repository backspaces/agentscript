import { terser } from 'rollup-plugin-terser'

export default {
    input: './vendor.js',
    output: {
        file: 'dist/vendor.esm.js',
        format: 'es',
        banner: '/* eslint-disable */',
    },
    plugins: [terser()],
}
