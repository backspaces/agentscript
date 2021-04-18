// Rollup entry point of all our THREE dependencies
// Needed due to THREE modules having direct paths
// Otherwise we'd need to include a node_modules sub-tree!

import * as THREE from '../node_modules/three/build/three.module.js'
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js'

export { THREE, OrbitControls }

// import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js'
// import { GUI } from '../node_modules/three/examples/jsm/libs/dat.gui.module.js'

// export { THREE, OrbitControls, Stats, GUI }
