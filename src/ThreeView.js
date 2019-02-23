import util from './util.js'
import SpriteSheet from './SpriteSheet.js'
import ThreeMeshes from './ThreeMeshes.js'

// import * as THREE from '../node_modules/three/build/three.module.js'
// import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js'
import { THREE, OrbitControls } from '../dist/vendor.esm.js'

util.toWindow({ THREE, OrbitControls })

class ThreeView {
    static defaultOptions(useThreeHelpers = true) {
        const options = {
            orthoView: false, // 'Perspective', 'Orthographic'
            clearColor: 0x000000, // clear to black
            // clearColor: new THREE.Color(0x000000), // clear to black
            useAxes: useThreeHelpers, // show x,y,z axes
            useGrid: useThreeHelpers, // show x,y plane
            useControls: useThreeHelpers, // navigation. REMIND: control name?
            spriteSize: 64,
            patches: {
                meshClass: 'PatchesMesh',
            },
            turtles: {
                meshClass: 'QuadSpritesMesh',
            },
            links: {
                meshClass: 'LinksMesh',
            },
        }
        util.forEach(options, (val, key) => {
            if (val.meshClass) {
                const Mesh = ThreeMeshes[val.meshClass]
                const meshOptions = Mesh.options()
                val.options = meshOptions
            }
        })

        return options
    }
    static printMeshOptions() {
        const obj = {}
        for (const MeshName in ThreeMeshes) {
            const optionsFcn = ThreeMeshes[MeshName].options
            if (optionsFcn) {
                obj[MeshName] = {
                    options: ThreeMeshes[MeshName].options(),
                }
            }
        }
        const str = util.objectToString(obj)
        console.log(str)
    }

    // -----------------------------------------------

    constructor(div, world, options = {}) {
        this.div = util.isString(div) ? document.getElementById(div) : div
        this.world = world
        // this.spriteSheet = model.spriteSheet // REMIND: Temp

        // Initialize options
        this.renderOptions = ThreeView.defaultOptions(true)
        Object.assign(this.renderOptions, options) // install defaults

        // Object.assign(this, ThreeView.defaultOptions) // install defaults
        // Object.assign(this, options) // override defaults
        if (this.renderOptions.spriteSize !== 0) {
            const isPOT = util.isPowerOf2(this.renderOptions.spriteSize)
            this.spriteSheet = new SpriteSheet(
                this.renderOptions.spriteSize,
                16,
                isPOT
            )
        }
        // this.view = new ThreeMeshes(this, rendererOptions)
        // this.view = new ThreeMeshes()

        // if (this.Renderer !== ThreeView) {
        //     throw Error('ThreeView ctor: Renderer not ThreeView', this.renderer)
        // }

        // Initialize Three.js
        this.initThree()
        this.initThreeHelpers()
        this.initMeshes()
    }
    // Init Three.js core: scene, camera, renderer
    initThree() {
        const { clientWidth, clientHeight } = this.div
        const { orthoView, clearColor } = this.renderOptions
        // const {width, height, centerX, centerY} = this.world
        // const { width, height } = this.world
        const [width, height] = this.world.getWorldSize()
        const [halfW, halfH] = [width / 2, height / 2]

        // this.spriteSheet.texture = new THREE.CanvasTexture(this.spriteSheet.ctx)
        // this.spriteSheet.setTexture(THREE.CanvasTexture)

        // REMIND: need world.minZ/maxZ
        const orthographicCam = new THREE.OrthographicCamera(
            // const orthographicCam = new OrthographicCamera(
            -halfW,
            halfW,
            halfH,
            -halfH,
            1,
            20 * width
        )
        orthographicCam.position.set(0, 0, 10 * width)
        orthographicCam.up.set(0, 0, 1)

        const perspectiveCam = new THREE.PerspectiveCamera(
            45,
            clientWidth / clientHeight,
            1,
            10000
        )
        // perspectiveCam.position.set(width + centerX, -width - centerY, width)
        perspectiveCam.position.set(width, -width, width)
        // perspectiveCam.lookAt(new THREE.Vector3(centerX, centerY, 0))
        perspectiveCam.up.set(0, 0, 1)

        const scene = new THREE.Scene()
        // scene.background = clearColor
        // scene.position = new THREE.Vector3(centerX, centerY, 0)
        const camera = orthoView ? orthographicCam : perspectiveCam

        // if (orthoView)
        //   camera.position.set(0, 0, 100 * width)
        // else
        //   camera.position.set(width, -width, width)
        // camera.up.set(0, 0, 1)

        const renderer = new THREE.WebGLRenderer({ canvas: this.div })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(clientWidth, clientHeight)
        renderer.setClearColor(clearColor)
        // this.div.appendChild(renderer.domElement)

        // window.addEventListener('resize', () => {
        //   const {clientWidth, clientHeight} = this.model.div
        //   camera.aspect = clientWidth / clientHeight
        //   camera.updateProjectionMatrix()
        //   renderer.setSize(clientWidth, clientHeight)
        // })
        // window.addEventListener('resize', () => {
        //     this.resize()
        // })

        Object.assign(this, {
            scene,
            camera,
            renderer,
            orthographicCam,
            perspectiveCam,
        })
    }
    resize() {
        const { clientWidth, clientHeight } = this.div
        const [width, height] = this.world.getWorldSize()

        if (this.renderOptions.orthoView) {
            const zoom = Math.min(clientWidth / width, clientHeight / height)
            this.renderer.setSize(zoom * width, zoom * height)
        } else {
            this.camera.aspect = clientWidth / clientHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(clientWidth, clientHeight)
        }
    }
    toggleCamera() {
        this.orthoView = !this.orthoView
        if (this.renderOptions.orthoView) {
            this.camera = this.orthographicCam
        } else {
            this.camera = this.perspectiveCam
        }
        this.resize()
    }
    // Return a dataURL for the current model step.
    snapshot(useOrtho = true) {
        // Don't set camera, can change w/ toggle below
        const { scene, renderer, model } = this
        const toggle = useOrtho && this.camera === this.perspectiveCam

        if (toggle) {
            this.toggleCamera()
            // model.draw(true) REMIND, need a draw proc
        }
        renderer.render(scene, this.camera)
        const durl = renderer.domElement.toDataURL()
        if (toggle) this.toggleCamera()
        return durl
    }
    initThreeHelpers() {
        const { scene, renderer, camera } = this
        // const {useAxes, useGrid, useControls, useStats, useGUI} = this
        const { useAxes, useGrid, useControls } = this.renderOptions
        const { width } = this.world
        const helpers = {}

        if (useAxes) {
            helpers.axes = new THREE.AxisHelper((1.5 * width) / 2)
            scene.add(helpers.axes)
        }
        if (useGrid) {
            helpers.grid = new THREE.GridHelper(1.25 * width, 10)
            helpers.grid.rotation.x = THREE.Math.degToRad(90)
            scene.add(helpers.grid)
        }
        if (useControls) {
            // helpers.controls = new THREE.OrbitControls(
            helpers.controls = new OrbitControls(camera, renderer.domElement)
        }

        Object.assign(this, helpers)
    }

    initMeshes() {
        this.meshes = {}
        util.forEach(this.renderOptions, (val, key) => {
            if (val.meshClass) {
                const Mesh = ThreeMeshes[val.meshClass]
                const options = Mesh.options() // default options
                Object.assign(options, val.options) // override by user's
                const mesh = new ThreeMeshes[val.meshClass](this, options)
                this.meshes[key] = mesh
                // mesh.init() // mesh.init(agentset)
            }
        })
    }

    draw() {
        // const {scene, camera} = this.view
        // util.forEach(this.meshes)
        // if (this.patches.length > 0) {
        //     this.patches.renderer.update(this.patches)
        // }

        // if (this.turtles.length > 0) {
        //     this.turtles.renderer.update(this.turtles)
        // }

        // if (this.links.length > 0) {
        //     this.links.renderer.update(this.links)
        // }

        // const links = this.meshes.links
        // links.update(????)

        // REMIND: generalize.
        this.renderer.render(this.scene, this.camera)
        // if (this.view.stats) this.view.stats.update()
    }
}

export default ThreeView

/*

- windowresize ends up incrementally growing canvas
        // window.addEventListener('resize', () => {
        //     this.resize()
        // })

- canvasMesh: convert from PlaneGeometry to PlaneBufferGeometry
- fix numX/Y vs width/height.

*/
