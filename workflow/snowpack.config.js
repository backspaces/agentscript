module.exports = {
    exclude: ['**/node_modules/**/*', '**/*.js', 'bin/*'],
    install: [
        'mapbox-gl',
        'three',
        'three/examples/jsm/controls/OrbitControls.js',
        'three/src/core/Object3D.js',
        'chart.js',
        'dat.gui',
        'fflate',
        '@turf/turf',
        'stats.js',
        '@firebase/app',
        '@firebase/database',
    ],
    polyfillNode: true,
}
