// externals = (id) => id.includes('/libs/')
// function externals (id) { return id.includes('/dist/') }
// function globals (id) {
//   const jsNames = {
//     'stats.wrapper.js': 'Stats',
//     'dat.gui.wrapper.js': 'dat',
//     'three.wrapper.js': 'THREE'
//   }
//   const fileName = id.replace(/^.*\//, '')
//   return jsNames[fileName]
// }

export default {
  input: 'src/AS.js',
  banner: '/* eslint-disable */',
  // external: externals,
  output: [
    { file: 'dist/AS.js',
      format: 'iife',
      // globals: globals,
      name: 'AS'
    },
    { file: 'dist/AS.module.js',
      format: 'es'
    }
  ]
}
