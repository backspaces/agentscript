export default {
  input: 'src/AS.js',
  output: [
    { file: 'dist/AS.js',
      format: 'iife',
      // globals: globals,
      name: 'AS',
      banner: '/* eslint-disable */'
    },
    { file: 'dist/AS.module.js',
      format: 'es',
      banner: '/* eslint-disable */'
    },
    { file: 'dist/AS.cjs',
      format: 'cjs',
      banner: '/* eslint-disable */'
    }
  ]
}
