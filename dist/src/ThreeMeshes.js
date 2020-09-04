// Meshes used by the Three.js view module

import { THREE } from '../vendor/three.esm.js'
// import * as THREE from 'https://unpkg.com/three@0.118.3/build/three.module.js'
import util from './util.js'
// import { Vector3 } from 'THREE'

function createQuad(r, z = 0) {
    // r is radius of xy quad: [-r,+r], z is quad z
    const vertices = [-r, -r, z, r, -r, z, r, r, z, -r, r, z]
    const indices = [0, 1, 2, 0, 2, 3]
    return { vertices, indices }
}
const unitQuad = createQuad(0.5, 0)

// Return typedColor[meshColorType] or color which must be correct type
function meshColor(color, mesh) {
    return color[mesh.options.colorType] || color
    // if (color) return color[mesh.options.colorType] || color
    // return color
}

function disposeMesh(mesh) {
    // if (!this.mesh) return
    // if (mesh.parent !== this.scene) {
    //     console.log('mesh parent not scene:', mesh)
    // }
    mesh.parent.remove(mesh)
    mesh.geometry.dispose()
    mesh.material.dispose()
    if (mesh.material.map) mesh.material.map.dispose()
}

const zMultiplier = 0.25
const PI = Math.PI

// function centerMesh(obj) {
//     // const {centerX, centerY} = obj.world
//     // obj.mesn.position.set(-centerX, -centerY, obj.options.z)
//     const { centerX, centerY, width, height } = obj.world
//     const z = obj.options.z //  / 100 // Math.max(width, height)
//     obj.mesh.position.set(-centerX, -centerY, z)
// }

// const getPixel = color => color.pixel || color

// Utility classes meant to be subclassed:
// ============= BaseMesh =============
// An abstract class for all Meshes.
export class BaseMesh {
    // static options(): https://goo.gl/sKdxoY
    constructor(view, options = {}) {
        // this.view = view
        // Overide default options
        options = Object.assign(this.constructor.options(), options)
        const { scene, world } = view
        Object.assign(this, { scene, world, view, options })
        this.mesh = null
        this.name = this.constructor.name
        // this.useSprites = this.name.match(/sprites/i) != null
    }
    // dispose() {
    //     if (!this.mesh) return
    //     if (this.mesh.parent !== this.scene) {
    //         console.log('mesh parent not scene')
    //     }
    //     this.mesh.parent.remove(this.mesh)
    //     this.mesh.geometry.dispose()
    //     this.mesh.material.dispose()
    //     if (this.mesh.material.map) this.mesh.material.map.dispose()
    // }
    centerMesh() {
        let { centerX, centerY, width, height } = this.world
        if (this.canvas) [centerX, centerY] = [0, 0]
        const z = this.options.z * zMultiplier //  Math.max(width, height)
        // console.log('centerMesh', centerX, centerY, width, height, z)

        this.mesh.position.set(-centerX, -centerY, z)
    }

    init() {
        throw Error('init is abstract, must be overriden')
    }
    update() {
        throw Error('update is abstract, must be overriden')
    }

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

// ============= CanvasMesh =============

export class CanvasMesh extends BaseMesh {
    static options() {
        return {
            // https://threejs.org/docs/#api/en/textures/Texture
            textureOptions: {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
            },
            z: 0.0,
            useSegments: false,
            canvas: null, // fill in w/ BaseMesh ctor options
            // colorType: undefined
        }
    }
    init(canvas = this.options.canvas) {
        if (this.mesh) disposeMesh(this.mesh)
        const { textureOptions, useSegments, z } = this.options
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
        // this.mesh.position.z = z
        this.scene.add(this.mesh)
    }
    update() {
        this.mesh.material.map.needsUpdate = true
    }
}

// Several classes for patches, turtles, links, etc.

// ============= DrawingMesh =============
// For now, just use CanvasMesh
// Drawing meshes are a form of Canvas Mesh
// export class DrawingMesh extends CanvasMesh {
//     static options() {
//         return {
//             textureOptions: {
//                 minFilter: THREE.NearestFilter,
//                 magFilter: THREE.NearestFilter,
//             },
//             z: 1.25,
//         }
//     }
//     init(drawing) {
//         super.init(drawing.ctx.canvas)
//     }
//     update() {
//         super.update()
//     }
// }

// ============= PatchesMesh =============

// Patch meshes are a form of Canvas Mesh
export class PatchesMesh extends CanvasMesh {
    // REMIND: use CanvasMesh options?
    static options() {
        return {
            // https://threejs.org/docs/#api/en/textures/Texture
            textureOptions: {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
            },
            z: 0.0,
            useSegments: false,
            colorType: 'pixel',
        }
    }
    init(canvas = this.view.patchesView.ctx.canvas) {
        // init() {
        // super.init(canvas, this.options.useSegments)
        super.init(canvas)
        this.centerMesh()
    }
    update(data, viewFcn = d => d) {
        if (data) this.view.patchesView.setPixels(data, viewFcn)
        this.view.patchesView.updateCanvas()
        super.update()
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
            pointSize: 1,
            color: null,
            z: 2.5,
            colorType: 'webgl',
        }
    }
    init() {
        if (this.mesh) disposeMesh(this.mesh)
        const pointSize = this.options.pointSize // REMIND: variable or fixed?
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
                  size: pointSize,
                  color: this.fixedColor,
              })
            : new THREE.PointsMaterial({
                  size: pointSize,
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
    update(turtles, viewFcn) {
        // const positionBuff = positionAttrib.array
        const vertices = []
        const colors = this.fixedColor ? null : []

        util.forLoop(turtles, (turtle, i) => {
            let { x, y, z } = turtle
            // if (!z) z = 0
            vertices.push(x, y, z)
            if (colors)
                colors.push(...meshColor(viewFcn(turtle, i).color, this))
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
            z: 1,
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
        const vertices = []
        const colors = this.fixedColor ? null : []
        util.forLoop(links, (link, i) => {
            let { x0, y0, z0, x1, y1, z1 } = link
            if (!z0) z0 = 0
            if (!z1) z1 = 0
            vertices.push(x0, y0, z0, x1, y1, z1)
            if (colors) {
                const color = meshColor(viewFcn(link, i).color, this)
                colors.push(...color, ...color)
            }
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

// ============= Obj3DMesh =============
const geometries = {
    // Use functions .. allows geo scale/rotate etc
    // Default: () => turtleGeometry(),
    Dart3D: () => turtleGeometry(),
    Cone: () => new THREE.ConeBufferGeometry(0.5).rotateZ(-PI / 2),
    Cube: () => new THREE.BoxBufferGeometry(),
    Cylinder: () =>
        new THREE.CylinderBufferGeometry(0.5, 0.5, 1).rotateZ(-PI / 2),
    Sphere: () => new THREE.SphereBufferGeometry(0.5),
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
        if (this.meshes) util.forLoop(this.meshes, mesh => disposeMesh(mesh))
        this.meshes = []
    }
    newMesh(geometryName = 'Dart3D', color = 'red', size = 1) {
        // let geometry = this.options.geometries[geometryName]
        if (geometryName === 'random') geometryName = util.oneKeyOf(geometries)
        let geometry = geometries[geometryName]
        if (!geometry) {
            console.log('Geometry not found: ', geometryName, '..using Default')
            geometryName = 'Dart3D'
            // geometry = this.options.geometries[geometryName]
            geometry = geometries[geometryName]
        }
        geometry = geometry()
        if (size !== 1) geometry.scale(size, size, size)
        // geometry.scale(turtlesSize, turtlesSize, turtlesSize)
        // if (['Cone', 'Cylinder']) geometry.rotateZ(util.degToRad(-90))
        // geometry.rotateZ(-PI / 2)

        color = new THREE.Color(...meshColor(color, this))
        const material = this.view.options.useLights
            ? new THREE.MeshPhongMaterial({ color })
            : new THREE.MeshBasicMaterial({ color })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.rotation.order = 'ZYX'
        // if (size !== 1) mesh.scale.set(size, size, size)
        if (this.options.useAxes) mesh.add(new THREE.AxesHelper(size))

        this.scene.add(mesh)
        return mesh
    }
    update(agents, viewFcn) {
        util.forLoop(agents, (agent, i) => {
            let mesh = this.meshes[agent.id]
            if (!mesh) {
                const view = viewFcn(agent, i)
                mesh = this.newMesh(view.shape, view.color, view.size)
                this.meshes[agent.id] = mesh
            }
            // const { x, y, z, obj3d } = agent
            const obj3d = agent.obj3d
            const pos = obj3d.position
            mesh.position.set(pos.x, pos.y, pos.z)
            const rot = obj3d.rotation
            mesh.rotation.set(rot.x, rot.y, rot.z)
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
    CanvasMesh,
    PatchesMesh,
    QuadSpritesMesh,
    PointsMesh,
    LinksMesh,
    Obj3DMesh,
}
