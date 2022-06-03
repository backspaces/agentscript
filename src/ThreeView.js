import * as util from './utils.js'
import World from './World.js'
import SpriteSheet from './SpriteSheet.js'
import PatchesView from './PatchesView.js'
import ThreeMeshes from './ThreeMeshes.js'

// import * as THREE from 'https://cdn.skypack.dev/three@0.120.0/build/three.module.js'
// import { OrbitControls } from 'https://cdn.skypack.dev/three@0.120.0/examples/jsm/controls/OrbitControls.js'
// import Stats from 'https://cdn.skypack.dev/stats.js'
import { THREE, OrbitControls } from '../vendor/three.js'

class ThreeView {
    static shapeNames() {
        return ThreeMeshes.Obj3DShapes
    }
    static defaultOptions(useThreeHelpers = true) {
        const options = {
            div: document.body,
            orthoView: false, // 'Perspective', 'Orthographic'
            clearColor: 0x000000, // clear to black
            // clearColor: new THREE.Color(0x000000), // clear to black
            useAxes: useThreeHelpers, // show x,y,z axes
            useGrid: useThreeHelpers, // show x,y plane
            // useControls: useThreeHelpers, // navigation. REMIND: control name?
            useWorldOutline: useThreeHelpers,
            // useStats: useThreeHelpers, // stats fps ui
            useLights: true, // maybe should be mesh option? not view?
            // REMIND: put in quadsprite options, defaulting to 64
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

        return options
    }

    // -----------------------------------------------

    // div? or can?
    // https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer
    // world can be options or a world instance, both work.
    constructor(
        // div = document.body,
        world = World.defaultOptions(),
        options = {} // overrides of defaultOptions
    ) {
        // options: override defaults:
        options = Object.assign(ThreeView.defaultOptions(), options)
        options.useLights =
            options.useLights || options.turtles.meshClass === 'Obj3DMesh'

        // this.div = options.div
        // if (util.isString(this.div))
        //     this.div = document.getElementById(this.div)
        // this.div = util.isString(div) ? document.getElementById(div) : div
        // this.world = new World(world)
        this.div = util.isString(options.div)
            ? document.getElementById(options.div)
            : options.div
        // If div height not set, default to 600px
        if (!this.div.height) this.div.style.height = '600px'

        this.world = new World(world.world || world) // world can be model
        this.options = options
        this.ticks = 0

        if (this.options.spriteSize !== 0) {
            const isPOT = util.isPowerOf2(this.options.spriteSize)
            this.spriteSheet = new SpriteSheet(
                this.options.spriteSize,
                16,
                isPOT
            )
        }

        if (options.patches && options.patches.meshClass === 'PatchesMesh') {
            this.patchesView = new PatchesView(
                this.world.width,
                this.world.height
            )
        }

        this.initThree()
        this.initThreeHelpers()
        this.initMeshes()
    }
    // Init Three.js core: scene, camera, renderer
    initThree() {
        const { clientWidth, clientHeight } = this.div
        const { orthoView, clearColor } = this.options
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
            0.1,
            10000
        )
        // perspectiveCam.position.set(width + centerX, -width - centerY, width)
        // perspectiveCam.position.set(width, -width, width)
        perspectiveCam.position.set(width, width, width)
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

        // const renderer = new THREE.WebGLRenderer({ canvas: this.div })
        // const isCanvas = util.isCanvas(this.div)
        // const threeOpts = isCanvas ? { canvas: this.div } : {}
        // const renderer = new THREE.WebGLRenderer(threeOpts)
        const renderer = new THREE.WebGLRenderer()
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(clientWidth, clientHeight)
        renderer.setClearColor(clearColor)
        // if (!isCanvas) this.div.appendChild(renderer.domElement)
        this.div.appendChild(renderer.domElement)

        this.orbitControls = new OrbitControls(camera, renderer.domElement)

        // window.addEventListener('resize', () => {
        //   const {clientWidth, clientHeight} = this.model.div
        //   camera.aspect = clientWidth / clientHeight
        //   camera.updateProjectionMatrix()
        //   renderer.setSize(clientWidth, clientHeight)
        // })
        window.addEventListener('resize', () => {
            this.resize()
        })

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
        const [width, height] = this.world.getWorldSize() // w/o "patchSize"

        if (this.options.orthoView) {
            const zoom = Math.min(clientWidth / width, clientHeight / height)
            this.renderer.setSize(zoom * width, zoom * height)
        } else {
            this.camera.aspect = clientWidth / clientHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(clientWidth, clientHeight)
        }
    }
    toggleCamera() {
        this.options.orthoView = !this.options.orthoView
        if (this.options.orthoView) {
            this.camera = this.orthographicCam
        } else {
            this.camera = this.perspectiveCam
        }
        this.resize()
        this.renderer.render(this.scene, this.camera)
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
        const { scene, renderer, camera, world } = this
        // const {useAxes, useGrid, useControls, useStats, useGUI} = this
        const {
            useAxes,
            useGrid,
            // useControls,
            // useStats,
            useLights,
            useWorldOutline,
        } = this.options
        const { width, height, depth, minZ } = this.world
        const helpers = {}

        if (useAxes) {
            helpers.axes = new THREE.AxesHelper((1.5 * width) / 2)
            scene.add(helpers.axes)
        }
        if (useGrid) {
            helpers.grid = new THREE.GridHelper(1.25 * width, 10)
            helpers.grid.rotation.x = THREE.Math.degToRad(90)
            helpers.grid.position.z = minZ
            scene.add(helpers.grid)
        }
        // if (useControls) {
        //     // helpers.controls = new THREE.OrbitControls(
        //     helpers.controls = new OrbitControls(camera, renderer.domElement)
        // }
        // if (useStats) {
        //     helpers.stats = new Stats()
        //     document.body.appendChild(helpers.stats.dom)
        // }
        if (useLights) {
            const width = world.width

            helpers.directionalLight = new THREE.DirectionalLight(0xffffff, 1)
            helpers.directionalLight.position.set(width, width, width)
            scene.add(helpers.directionalLight)

            helpers.diffuseLight = new THREE.AmbientLight(0x404040) // soft white light
            scene.add(helpers.diffuseLight)
        }
        if (useWorldOutline) {
            const geometry = new THREE.BoxBufferGeometry(width, height, depth)
            const edges = new THREE.EdgesGeometry(geometry)
            helpers.outline = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0x80808080 })
            )
            scene.add(helpers.outline)
        }

        this.helpers = helpers
        // Object.assign(this, helpers)
    }

    initMeshes() {
        this.meshes = {}
        util.forLoop(this.options, (val, key) => {
            if (val.meshClass && val.meshClass !== 'NullMesh') {
                // if (val.meshClass === 'NullMesh')
                const Mesh = ThreeMeshes[val.meshClass]
                const options = val // val.options // null ok
                // const options = Mesh.options() // default options
                // // override by user's
                // if (val.options) Object.assign(options, val.options)
                // const mesh = new ThreeMeshes[val.meshClass](this, options)
                const mesh = new Mesh(this, options)
                this.meshes[key] = mesh
                mesh.init() // can be called again by modeler
            }
        })
    }
    // Call this right after ctor. Or add options to default params
    setPatchesSmoothing(smooth = false) {
        const filter = smooth ? THREE.LinearFilter : THREE.NearestFilter
        this.meshes.patches.mesh.material.map.magFilter = filter
    }

    idle(ms = 32) {
        util.timeoutLoop(() => this.render(), -1, ms)
    }
    render() {
        // REMIND: generalize.
        this.renderer.render(this.scene, this.camera)
        this.ticks++
        // if (this.helpers.stats) this.helpers.stats.update()
        // if (this.view.stats) this.view.stats.update()
    }

    getSprite(shape, fillColor, strokeColor = null) {
        return this.spriteSheet.getSprite(shape, fillColor, strokeColor)
    }

    // Sugar if viewFcn is a constant obj, convert to fcn.
    checkViewFcn(viewFcn) {
        return util.isObject(viewFcn) ? () => viewFcn : viewFcn
    }

    patchesCanvas() {
        return this.patchesView.ctx.canvas
    }
    clearPatches(color) {
        // color can be typed, pixel, css, or undefined (clear to transparent)
        this.patchesView.clear(color)
        // no args: just merge pixels into canvas, set mesh needsUpdate true
        this.meshes.patches.update()
    }
    // drawPatchesImage(img) {
    drawPatchesImage(img) {
        // this.meshes.patches.options.textureOptions = {
        const options = this.meshes.patches.options
        options.textureOptions = {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.LinearFilter,
        }
        options.canvas = img
        this.meshes.patches.init()
    }
    createPatchPixels(pixelFcn) {
        this.patchesView.createPixels(pixelFcn)
        const data = this.patchesView.pixels
        this.meshes.patches.update(data, d => d)
    }
    drawPatches(data, viewFcn) {
        // REMIND: may not be needed, patchesView does this check too.
        if (util.isOofA(data)) data = util.toAofO(data)
        this.meshes.patches.update(data, viewFcn)
    }
    drawTurtles(data, viewFcn) {
        if (util.isOofA(data)) data = util.toAofO(data)
        viewFcn = this.checkViewFcn(viewFcn)
        this.meshes.turtles.update(data, viewFcn)
    }
    drawLinks(data, viewFcn) {
        if (util.isOofA(data)) data = util.toAofO(data)
        viewFcn = this.checkViewFcn(viewFcn)
        this.meshes.links.update(data, viewFcn)
    }
}

export default ThreeView

/*

- patches smoothing: set textureOptions to linear for mag filter

*/
