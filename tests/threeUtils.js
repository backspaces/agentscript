import { THREE, OrbitControls } from '../vendor/three.esm.js'

// greggman's defaults
export function setDefaultStyle(id = 'canvas') {
    const style = document.createElement('style')
    style.innerHTML = `
      body { margin: 0; padding: 0; height: 100%; }
      #${id} { width: 100%; height: 100%; display: block; }
  `
    document.head.append(style)

    const meta = document.createElement('meta')
    meta.setAttribute('name', 'viewport')
    meta.content = 'width=device-width, initial-scale=1'

    document.head.append(meta)
}

// https://threejsfundamentals.org/threejs/lessons/threejs-responsive.html
export function checkResize(renderer, camera) {
    const canvas = renderer.domElement
    const pixelRatio = window.devicePixelRatio

    const width = (canvas.clientWidth * pixelRatio) | 0 // | round down
    const height = (canvas.clientHeight * pixelRatio) | 0

    const needResize = canvas.width !== width || canvas.height !== height

    if (needResize) {
        renderer.setSize(width, height, false)
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
    }
    return needResize
}

export function animate(renderer, scene, camera, fcn) {
    function render(time) {
        checkResize(renderer, camera)

        fcn(time)

        renderer.render(scene, camera)
        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
}

export function directionalLight(
    scene,
    position,
    color = 0xffffff,
    intensity = 1
) {
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(...position)
    scene.add(light)
}
