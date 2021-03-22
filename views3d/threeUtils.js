import * as THREE from 'https://cdn.skypack.dev/three@0.120.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.120.0/examples/jsm/controls/OrbitControls.js'
import Stats from 'https://cdn.skypack.dev/stats.js'

import * as util from '../src/utils.js'
const degToRad = util.degToRad
const radToDeg = util.radToDeg

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

export function newCamera(renderer, position, up = [0, 0, 1]) {
    const canvas = renderer.domElement
    const camera = new THREE.PerspectiveCamera(
        45, // fov
        canvas.clientWidth / canvas.clientHeight, // aspect
        1, // near
        10000 //far
    )

    camera.position.set(...position)
    camera.up.set(...up)

    checkResize(renderer, camera)

    return camera
}
export function modelCamera(renderer, model) {
    const width = model.world.width
    const position = [width, width, width]
    return newCamera(renderer, position)
}
export function addModelHelpers(renderer, scene, camera, model) {
    addHelpers(renderer, scene, camera, model.world.width)
}
export function addHelpers(renderer, scene, camera, width, zUp = true) {
    // const width = model.world.width
    const axes = new THREE.AxesHelper((1.5 * width) / 2)
    const grid = new THREE.GridHelper(1.25 * width, 10)
    if (zUp) grid.rotation.x = degToRad(90)

    const orbitControl = new OrbitControls(camera, renderer.domElement)

    const stats = new Stats()
    document.body.appendChild(stats.dom)

    scene.add(axes)
    scene.add(grid)
}

export function addMesh(
    scene,
    geometryName,
    material = 'Phong',
    color = 'red',
    geometryParams = []
) {
    geometryName = geometryName + 'Geometry'
    material = 'Mesh' + material + 'Material'
    const geometry = new THREE[geometryName](...geometryParams)
    material = new THREE[material]({ color })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh
}

export function meshAngles(mesh, order = 'XYZ') {
    const euler = mesh.rotation
    const { x, y, z } = euler
    return [x, y, z].map(rad => util.precision(radToDeg(rad)))
}

export function angleTowards(mesh, target) {
    const { x, y, z } = mesh.position
    const { x: tx, y: ty, z: tz } = target.position
    const [dx, dy, dz] = [tx - x, ty - y, tz - z]
    const xyhypot = Math.hypot(dx, dy)
    const headingTowards = Math.atan2(dy, dx)
    const pitchTowards = Math.atan2(dz, xyhypot)

    mesh.rotation.set(0, 0, 0)
    mesh.rotateZ(headingTowards)
    mesh.rotateY(-pitchTowards)
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

export function modelLight(scene, model, intensity = 1, color = 0xffffff) {
    const width = model.world.width

    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(width, width, width)
    scene.add(light)

    // const light1 = new THREE.DirectionalLight(color, intensity)
    // light1.position.set(width, width, -width)
    // scene.add(light1)

    const diffuse = new THREE.AmbientLight(0x404040) // soft white light
    scene.add(diffuse)
}

const primitiveNames = [
    'Box',
    'Circle',
    'Cone',
    'Cylinder',
    'Dodecahedron',
    // 'Extrude',
    'Icosahedron',
    // 'Lathe',
    'Octahedron',
    // 'Parametric',
    'Plane',
    // 'Polyhedron',
    'Ring',
    // 'Shape',
    'Sphere',
    'Tetrahedron',
    // 'Text',
    'Torus',
    // 'TorusKnot',
    // 'Tube',
]
export function primitiveGeometry(name, params = []) {
    if (!name) name = util.oneOf(primitiveNames)
    name = name[0].toUpperCase() + name.slice(1)
    const geometryName = name + 'BufferGeometry'
    return new THREE[geometryName](...params)
}

export function turtleGeometry() {
    const ax = 0.5
    const bx = -0.5
    const by = -0.5
    const cx = -0.3
    const top = 0.35
    const bot = 0

    const geometry = new THREE.Geometry()
    geometry.vertices.push(
        new THREE.Vector3(ax, 0, bot), //   A 0
        new THREE.Vector3(bx, by, bot), //  B 1
        new THREE.Vector3(cx, 0, top), //   C 2
        new THREE.Vector3(bx, -by, bot), // D 3
        new THREE.Vector3(cx, 0, bot) //    E 4
    )

    const [A, B, C, D, E] = [0, 1, 2, 3, 4]
    geometry.faces.push(
        new THREE.Face3(A, D, C),
        new THREE.Face3(A, C, B),
        new THREE.Face3(A, B, E),
        new THREE.Face3(A, E, D),
        new THREE.Face3(C, D, E),
        new THREE.Face3(C, E, B)
    )

    geometry.computeFaceNormals()
    return geometry
}

export function disposeMesh(mesh, scene) {
    mesh.geometry.dispose()
    mesh.material.dispose()
    // mesh.material = mesh.geometry = null
    scene.remove(mesh)
}

export function matrixToString(matrix, toDegrees = true, precision = 2) {
    if (matrix.isMesh) matrix = matrix.matrix.elements
    if (matrix.elements) matrix = matrix.elements
    const isScale = idx => [0, 5, 10].includes(idx)
    // const isPosition = idx => util.mod(idx, 4) === 3
    const isPosition = idx => idx >= 12
    if (toDegrees)
        matrix = matrix.map((el, i) =>
            isScale(i) || isPosition(i) ? el : radToDeg(el)
        )
    matrix = matrix.map(num => util.precision(num, precision))
    matrix = matrix.map(num => ('' + num).padStart(10, ' '))
    const r0 = matrix.slice(0, 4) //.toString().padStart(10, ' ')
    const r1 = matrix.slice(4, 8) //.toString().padStart(10, ' ')
    const r2 = matrix.slice(8, 12) //.toString().padStart(10, ' ')
    const r3 = matrix.slice(12, 16) //.toString().padStart(10, ' ')
    return `${r0}
${r1}
${r2}
${r3}`.replace(/,/g, ', ')
}
