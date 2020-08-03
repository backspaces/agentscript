import { THREE, OrbitControls, Stats } from '../vendor/three.esm.js'

let stats

// greggman's defaults
export function setDefaultStyle(id = 'canvas') {
    const style = document.createElement('style')
    style.innerHTML = `
      html, body { margin: 0; padding: 0; height: 100%; }
      #${id} { width: 100%; height: 100%; display: block; }
  `
    document.head.append(style)

    const meta = document.createElement('meta')
    meta.setAttribute('name', 'viewport')
    meta.content = 'width=device-width, initial-scale=1'

    document.head.append(meta)
}

export function modelCamera(renderer, model) {
    const canvas = renderer.domElement
    const camera = new THREE.PerspectiveCamera(
        45, // fov
        canvas.clientWidth / canvas.clientHeight, // aspect
        1, // near
        10000 //far
    )

    const width = model.world.width
    // perspectiveCam.position.set(width + centerX, -width - centerY, width)
    camera.position.set(width, width, width)
    // perspectiveCam.lookAt(new THREE.Vector3(centerX, centerY, 0))
    camera.up.set(0, 0, 1)

    checkResize(renderer, camera)

    return camera
}
export function addModelHelpers(renderer, scene, camera, model) {
    const width = model.world.width

    const axes = new THREE.AxesHelper((1.5 * width) / 2)
    const grid = new THREE.GridHelper(1.25 * width, 10)
    grid.rotation.x = THREE.Math.degToRad(90)

    const orbitControl = new OrbitControls(camera, renderer.domElement)

    stats = new Stats()
    document.body.appendChild(stats.dom)

    scene.add(axes)
    scene.add(grid)
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

export function renderOnce(renderer, scene, camera, fcn) {
    checkResize(renderer, camera)
    fcn()
    renderer.render(scene, camera)
}
export function animate(renderer, scene, camera, fcn) {
    function render(time) {
        if (!stats) {
            stats = new Stats()
            document.body.appendChild(stats.dom)
        }
        // stats.begin()

        checkResize(renderer, camera)
        fcn(time)
        renderer.render(scene, camera)
        requestAnimationFrame(render)

        // stats.end()
        stats.update()
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

export function modelLight(scene, model, color = 0xffffff, intensity = 1) {
    const width = model.world.width
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(width, width, width)
    scene.add(light)
}
