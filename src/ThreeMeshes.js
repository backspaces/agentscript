// Meshes used by the Three.js view module

// import * as THREE from 'https://cdn.skypack.dev/three@0.120.0/build/three.module.js'
import { THREE } from '../vendor/three.js'
import AgentArray from './AgentArray.js'
// import Color from './Color.js'
import * as util from './utils.js'

// ========== global utilities ==========
function createQuad(r, z = 0) {
    // r is radius of xy quad: [-r,+r], z is quad z
    const vertices = [-r, -r, z, r, -r, z, r, r, z, -r, r, z]
    const indices = [0, 1, 2, 0, 2, 3]
    return { vertices, indices }
}
const unitQuad = createQuad(0.5, 0)
function meshColor(color, mesh) {
    return color[mesh.options.colorType] || color
}
function disposeMesh(mesh) {
    // mesh.parent.remove(mesh)
    mesh.parent.remove(mesh)
    mesh.geometry.dispose()
    mesh.material.dispose()
    if (mesh.material.map) mesh.material.map.dispose()
    // mesh.userData = {}
    util.forLoop(mesh.userData, (val, key) => delete mesh.userData[key])
}
const zMultiplier = 0.25
const PI = Math.PI

// ============= BaseMesh =============

export class BaseMesh {
    // An abstract class for all Meshes. Assume all classes have options:
    // static options() {..}
    constructor(view, options = {}) {
        // this.view = view
        // Overide default options
        options = Object.assign(this.constructor.options(view), options)
        const { scene, world } = view
        Object.assign(this, { scene, world, view, options })
        this.mesh = null
        this.name = this.constructor.name
    }
    centerMesh() {
        let { centerX, centerY, width, height } = this.world
        if (this.canvas) [centerX, centerY] = [0, 0]
        const z =
            this.view.meshes.patches === this &&
            this.view.options.turtles.meshClass === 'Obj3DMesh'
                ? this.world.minZ
                : this.options.z * zMultiplier //  Math.max(width, height)
        this.mesh.position.set(-centerX, -centerY, z)
    }

    init() {
        throw Error('init is abstract, must be overriden')
    }
    update() {
        throw Error('update is abstract, must be overriden')
    }
    // clear() {
    //     if (this.mesh) {
    //         disposeMesh(this.mesh)
    //         this.mesh = null
    //         this.init()
    //     } else if (this.meshes) {
    //         this.meshes.forEach(mesh => disposeMesh(mesh))
    //         this.meshes = null
    //         this.init()
    //     } else {
    //         throw Error('BaseMesh.clear: no meshes available')
    //     }
    // }

    get spriteSheetTexture() {
        if (this.view.spriteSheet.texture == null) {
            const texture = new THREE.CanvasTexture(
                this.view.spriteSheet.ctx.canvas
            )
            this.view.spriteSheet.texture = texture
        }
        return this.view.spriteSheet.texture
    }
}

// ============= NullMesh =============
// A no-op mesh
export class NullMesh {
    constructor() {
        this.options = {}
    }
    init() {}
    update() {}
}
// ============= CanvasMesh =============

export class CanvasMesh extends BaseMesh {
    static options(view) {
        return {
            // https://threejs.org/docs/#api/en/textures/Texture
            textureOptions: {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
            },
            z: 0.0,
            useSegments: false,
            canvas: view.patchesCanvas(),
            // colorType: undefined
        }
    }
    init() {
        if (this.mesh) disposeMesh(this.mesh)
        const { canvas, textureOptions, useSegments, z } = this.options
        Object.assign(this, { canvas, z, textureOptions })
        const { width, height, centerX, centerY } = this.world

        const texture = new THREE.CanvasTexture(canvas)
        Object.assign(texture, textureOptions)

        const geometry = new THREE.PlaneBufferGeometry(
            width,
            height,
            useSegments ? width : 1,
            useSegments ? height : 1
        )
        // not needed for centered world
        // geometry.translate(-centerX, -centerY, 0)

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            // shading: THREE.FlatShading, // obsolete
            // https://threejsfundamentals.org/threejs/lessons/threejs-materials.html
            // flatShading: true, // ?? default false.
            side: THREE.DoubleSide,
            transparent: true,
        })

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.z = z
        this.scene.add(this.mesh)
    }
    update() {
        this.mesh.material.map.needsUpdate = true
    }
}

// ============= PatchesMesh =============

// Patch meshes are a form of Canvas Mesh
export class PatchesMesh extends CanvasMesh {
    static options(view) {
        // REMIND: use CanvasMesh options?
        return {
            // https://threejs.org/docs/#api/en/textures/Texture
            textureOptions: {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
            },
            z: 0.0,
            useSegments: false,
            colorType: 'pixel',
            canvas: view.patchesCanvas(),
        }
    }
    // init(canvas = this.view.patchesView.ctx.canvas) {
    // init(canvas = this.view.patchesCanvas()) {
    init() {
        // init() {
        // super.init(canvas, this.options.useSegments)
        super.init()
        this.centerMesh()
    }
    update(data, viewFcn = d => d) {
        if (data) this.view.patchesView.setPixels(data, viewFcn)
        this.view.patchesView.updateCanvas()
        super.update()
    }
}

// ============= TerrainMesh =============

export class TerrainMesh extends PatchesMesh {
    static options() {
        return {
            textureOptions: {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
            },
            z: 0.0,
            useSegments: true,
            // colorType: 'image',
        }
    }
}
// ============= QuadSpritesMesh =============

export class QuadSpritesMesh extends BaseMesh {
    static options() {
        return {
            z: 2.0,
            colorType: 'css',
        }
    }
    init() {
        if (this.mesh) disposeMesh(this.mesh)
        const texture = this.spriteSheetTexture

        // const vertices = new Float32Array()
        // const uvs = new Float32Array()
        // const indices = new Uint32Array()
        const geometry = new THREE.BufferGeometry()

        // geometry.translate(-this.world.centerX, -this.world.centerY, 0)

        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute([], 3)
        )
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute([], 2))
        geometry.setIndex(new THREE.Uint32BufferAttribute([], 1))
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            alphaTest: 0.5,
            // Lets us see underside. Maybe not always?
            side: THREE.DoubleSide,
        })

        this.mesh = new THREE.Mesh(geometry, material)
        // this.mesh.position.z = this.options.z
        this.centerMesh()

        this.scene.add(this.mesh)
    }
    // update takes any array of objects with x,y,z,size,sprite .. position & uvs
    // REMIND: optimize by flags for position/uvs need updates
    update(turtles, viewFcn) {
        const { vertices, indices } = unitQuad
        const positions = new Float32Array(vertices.length * turtles.length)
        const uvs = []
        const indexes = []

        // for (let i = 0; i < turtles.length; i++) {
        util.forLoop(turtles, (turtle, i) => {
            // const turtle = turtles[i]
            if (turtle.hidden) return

            let { x, y, z, theta } = turtle
            // if (!z) z = 0

            const viewData = viewFcn(turtle, i)
            let { size, sprite } = viewData
            if (!sprite)
                sprite = this.view.getSprite(
                    viewData.shape,
                    meshColor(viewData.color, this)
                )

            // const { size, sprite } = viewFcn(turtle, i)

            const cos = Math.cos(theta)
            const sin = Math.sin(theta)
            const offset = i * vertices.length

            for (let j = 0; j < vertices.length; j = j + 3) {
                const x0 = vertices[j]
                const y0 = vertices[j + 1]
                positions[j + offset] = size * (x0 * cos - y0 * sin) + x
                positions[j + offset + 1] = size * (x0 * sin + y0 * cos) + y
                positions[j + offset + 2] = z
            }
            indexes.push(...indices.map(ix => ix + i * 4)) // 4
            uvs.push(...sprite.uvs)
        })

        this.mesh.geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
            // new THREE.Float32BufferAttribute(positions, 3)
        )
        this.mesh.geometry.setAttribute(
            'uv',
            new THREE.Float32BufferAttribute(uvs, 2)
        )
        this.mesh.geometry.setIndex(new THREE.Uint32BufferAttribute(indexes, 1))
    }
}

// ============= PointsMesh =============

export class PointsMesh extends BaseMesh {
    static options() {
        return {
            // Points are fixed size (in material). Variable requires shader.
            // https://discourse.threejs.org/t/how-to-display-points-of-different-sizes-using-three-points/4751/7
            size: 1,
            color: null,
            z: 2.5,
            colorType: 'webgl',
        }
    }
    init() {
        if (this.mesh) disposeMesh(this.mesh)
        const size = this.options.size
        this.fixedColor = this.options.color
            ? new THREE.Color(...meshColor(this.options.color, this))
            : null

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute([], 3)
        )
        if (!this.fixedColor) {
            geometry.setAttribute(
                'color',
                new THREE.Float32BufferAttribute([], 3)
            )
        }

        const material = this.fixedColor
            ? new THREE.PointsMaterial({
                  size: size,
                  color: this.fixedColor,
              })
            : new THREE.PointsMaterial({
                  size: size,
                  vertexColors: true,
              })

        this.mesh = new THREE.Points(geometry, material)
        // this.mesh.position.z = this.options.z
        this.centerMesh()

        this.scene.add(this.mesh)
    }
    // update takes any array of objects with x,y,z,color .. position & color
    // If non-null color passed to init, only x,y,z .. position used
    // REMIND: optimize by flags for position/uvs need updates
    update(agents, viewFcn) {
        // const positionBuff = positionAttrib.array
        const vertices = []
        const colors = this.fixedColor ? null : []

        util.forLoop(agents, (agent, i) => {
            if (agent.hidden) return

            let { x, y, z } = agent
            // if (!z) z = 0
            vertices.push(x, y, z)
            if (colors) colors.push(...meshColor(viewFcn(agent, i).color, this))
        })
        this.mesh.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(vertices, 3)
        )

        if (colors) {
            this.mesh.geometry.setAttribute(
                'color',
                new THREE.Float32BufferAttribute(colors, 3)
            )
        }
    }
}

// ============= LinksMesh =============

export class LinksMesh extends BaseMesh {
    static options() {
        return {
            color: null,
            z: 0,
            colorType: 'webgl',
        }
    }
    init() {
        if (this.mesh) disposeMesh(this.mesh)
        this.fixedColor = this.options.color
            ? new THREE.Color(...meshColor(this.options.color, this))
            : null

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute([], 3)
        )
        if (!this.fixedColor) {
            geometry.setAttribute(
                'color',
                new THREE.Float32BufferAttribute([], 3)
            )
        }
        // geometry.translate(-this.world.centerX, -this.world.centerX, 0)

        const material = this.fixedColor
            ? new THREE.LineBasicMaterial({ color: this.fixedColor })
            : new THREE.LineBasicMaterial({ vertexColors: true })

        this.mesh = new THREE.LineSegments(geometry, material)
        this.centerMesh()
        this.scene.add(this.mesh)
    }
    // update takes any array of objects with color & end0, end1 having x,y,z
    // REMIND: optimize by flags for position/uvs need updates
    update(links, viewFcn) {
        // if (links.hidden) return // all links

        const vertices = []
        const colors = this.fixedColor ? null : []
        util.forLoop(links, (link, i) => {
            // if (link.hidden) return // just this link

            let { x0, y0, z0, x1, y1, z1 } = link
            // REMIND: test for null/undefined, z0 === 0 is set twice!
            if (!z0) z0 = 0
            if (!z1) z1 = 0
            vertices.push(x0, y0, z0, x1, y1, z1)
            if (colors) {
                const color = meshColor(viewFcn(link, i).color, this)
                colors.push(...color, ...color)
            }
        })

        // if (vertices.length === 0) return // possible?
        this.mesh.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(vertices, 3)
        )

        if (colors) {
            this.mesh.geometry.setAttribute(
                'color',
                new THREE.Float32BufferAttribute(colors, 3)
            )
        }
    }
}

// ============= Obj3DMesh =============
const geometries = {
    // Use functions .. needed for individual geometry differences
    Dart: () => turtleGeometry(),
    Cone0: () => new THREE.ConeBufferGeometry(0.5).rotateX(PI / 2),
    Cone: () => new THREE.ConeBufferGeometry(0.5).rotateZ(-PI / 2),
    Cube: () => new THREE.BoxBufferGeometry(),
    Cylinder0: () =>
        new THREE.CylinderBufferGeometry(0.5, 0.5, 1).rotateX(PI / 2),
    Cylinder: () =>
        new THREE.CylinderBufferGeometry(0.5, 0.5, 1).rotateZ(-PI / 2),
    Sphere: () => new THREE.SphereBufferGeometry(0.5),
}
const Obj3DShapes = AgentArray.fromArray(Object.keys(geometries))
function getGeometry(shape) {
    let geometry = geometries[shape]
    if (!geometry) {
        console.log('Geometry not found: ', shape, '..using Default')
        shape = 'Dart'
        geometry = geometries[shape]
    }
    return [geometry(), shape]
}

export class Obj3DMesh extends BaseMesh {
    static options() {
        return {
            // color: null, // if const color, can share materials
            z: 2.0,
            colorType: 'webgl',
            // size: 2,
            useAxes: false,
        }
    }
    init() {
        // if (this.meshes) for (mesh of this.meshes) mesh.dispose()
        // if (this.meshes) util.forLoop(this.meshes, mesh => disposeMesh(mesh))
        if (this.meshes) this.meshes.forEach(mesh => disposeMesh(mesh))
        // this.meshes = []
        this.meshes = new Map()
        // Used to manage agents who have died
        this.lastAgentsLength = null
        this.lastAgentsMaxID = null
    }
    newMesh(shape = 'Dart', color = 'red', size = 1) {
        var [geometry, shape] = getGeometry(shape)
        if (size !== 1) geometry.scale(size, size, size)

        const view = { shape, color, size }

        color = new THREE.Color(...meshColor(color, this))
        const material = this.view.options.useLights
            ? new THREE.MeshPhongMaterial({ color })
            : new THREE.MeshBasicMaterial({ color })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.rotation.order = 'ZYX'
        // if (size !== 1) mesh.scale.set(size, size, size)
        if (this.options.useAxes) mesh.add(new THREE.AxesHelper(size))

        mesh.userData.view = view

        this.scene.add(mesh)
        return mesh
    }
    checkDeadAgents(agents) {
        const lastLen = this.lastAgentsLength
        const lastID = this.lastAgentsMaxID
        if (lastLen === 0) return
        if (
            lastLen != null && // first time through
            (lastLen > agents.length || agents.last().id !== lastID)
        ) {
            // remove dead agents
            console.log('look for dead agents')
            this.meshes.forEach((mesh, agent) => {
                if (mesh.userData.agent.id === -1) {
                    console.log('found one:', mesh.userData.agent)
                    disposeMesh(mesh)
                    this.meshes.delete(agent)
                }
            })
        }
        this.lastAgentsLength = agents.length
        this.lastAgentsMaxID = agents.length === 0 ? null : agents.last().id
    }
    update(agents, viewFcn) {
        this.checkDeadAgents(agents)
        if (agents.hidden) return // all agents

        util.forLoop(agents, agent => {
            if (agent.hidden) return // just this agent

            const view = viewFcn(agent)
            let mesh = this.meshes.get(agent)

            // if (mesh) {
            //     const { shape, color, size } = mesh.userData.view
            //     if (
            //         shape !== view.shape ||
            //         (view.color !== 'random' && color !== view.color) ||
            //         size != view.size
            //     ) {
            //         disposeMesh(mesh)
            //         this.meshes.set(agent, null)
            //         mesh = null
            //     }
            // }
            if (mesh) {
                var { shape, color, size } = mesh.userData.view

                // if (view.color !== 'random' && color !== view.color) {
                if (color !== view.color) {
                    color = mesh.userData.view.color = view.color
                    color = new THREE.Color(...meshColor(color, this))
                    mesh.material.color = color
                    // mesh.material.needsUpdate = true
                }
                if (shape !== view.shape) {
                    var [geometry, shape] = getGeometry(view.shape)
                    mesh.geometry.dispose()
                    mesh.geometry = geometry
                    mesh.geometry.scale(size, size, size)
                    mesh.userData.view.shape = shape
                    // mesh.geometry.needsUpdate = true
                }
                if (size !== view.size) {
                    size = view.size / size
                    mesh.geometry.scale(size, size, size)
                    mesh.userData.view.size = view.size
                    // mesh.geometry.needsUpdate = true
                }
            }

            if (!mesh) {
                mesh = this.newMesh(view.shape, view.color, view.size)
                this.meshes.set(agent, mesh)
                mesh.userData.agent = agent
            }

            const obj3d = agent.obj3d
            if (obj3d) {
                const pos = obj3d.position
                mesh.position.set(pos.x, pos.y, pos.z)
                const rot = obj3d.rotation
                mesh.rotation.set(rot.x, rot.y, rot.z)
            } else {
                mesh.position.set(agent.x, agent.y, agent.z)
                mesh.rotation.set(0, 0, 0)
            }
        })
    }
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

export default {
    BaseMesh,
    NullMesh,
    CanvasMesh,
    PatchesMesh,
    QuadSpritesMesh,
    PointsMesh,
    LinksMesh,
    Obj3DMesh,
    Obj3DShapes,
}
