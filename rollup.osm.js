import commonjs from 'rollup-plugin-commonjs'

export default {
    input: './node_modules/osmtogeojson/osmtogeojson.js',
    output: {
        file: 'dist/osmtogeojson.esm.js',
        format: 'es',
    },
    plugins: [commonjs({})],
}
