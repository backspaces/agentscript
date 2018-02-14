export default {
  input: 'src/AS.js',
  output: [
    { file: 'dist/AS.js',
      format: 'umd',
      name: 'AS',
      banner: '/* eslint-disable */'
    },
    { file: 'dist/AS.module.js',
      format: 'es',
      banner: '/* eslint-disable */'
    }
    // { file: 'dist/AS.umd.js',
    //   format: 'umd',
    //   name: 'AS',
    //   banner: '/* eslint-disable */'
    // },
    // { file: 'dist/AS.cjs',
    //   format: 'cjs',
    //   banner: '/* eslint-disable */'
    // }
  ]
}
