// Meshes used by the Three.js view module

import { THREE } from '../vendor/three.esm.min.js'
import util from './util.js'

function createQuad(r, z = 0) {
    // r is radius of xy quad: [-r,+r], z is quad z
    const vertices = [-r, -r, z, r, -r, z, r, r, z, -r, r, z]
    const indices = [0, 1, 2, 0, 2, 3]
    return { vertices, indices }
}
const unitQuad = createQuad(0.5, 0)

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
    dispose() {
        if (!this.mesh) return
        if (this.mesh.parent !== this.scene) {
            console.log('mesh parent not scene')
        }
        this.mesh.parent.remove(this.mesh)
        this.mesh.geometry.dispose()
        this.mesh.material.dispose()
        if (this.mesh.material.map) this.mesh.material.map.dispose()
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
            z: 1.0,
            useSegments: false,
            canvas: null, // fill in w/ BaseMesh ctor options
        }
    }
    init(canvas = this.options.canvas) {
        if (this.mesh) this.dispose()
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
        geometry.translate(centerX, centerY, 0)

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
            z: 1.0,
            useSegments: false,
        }
    }
    init(canvas = this.view.patchesView.ctx.canvas) {
        // init() {
        // super.init(canvas, this.options.useSegments)
        super.init(canvas)
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
        }
    }
    init() {
        if (this.mesh) this.dispose()
        const texture = this.spriteSheetTexture

        const vertices = new Float32Array()
        const uvs = new Float32Array()
        const indices = new Uint32Array()
        const geometry = new THREE.BufferGeometry()
        geometry.addAttribute(
            'position',
            new THREE.BufferAttribute(vertices, 3)
        )
        geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2))
        geometry.setIndex(new THREE.BufferAttribute(indices, 1))
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            alphaTest: 0.5,
            // Lets us see underside. Maybe not always?
            side: THREE.DoubleSide,
        })

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.z = this.options.z
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
            if (!z) z = 0

            const viewData = viewFcn(turtle, i)
            let { size, sprite } = viewData
            if (!sprite)
                sprite = this.view.getSprite(viewData.shape, viewData.color)

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
        // const mesh = this.mesh
        const positionAttrib = this.mesh.geometry.getAttribute('position')
        const uvAttrib = this.mesh.geometry.getAttribute('uv')
        const indexAttrib = this.mesh.geometry.getIndex()
        positionAttrib.setArray(positions)
        positionAttrib.needsUpdate = true
        uvAttrib.setArray(new Float32Array(uvs))
        uvAttrib.needsUpdate = true
        indexAttrib.setArray(new Uint32Array(indexes))
        indexAttrib.needsUpdate = true
    }
}

// ============= PointsMesh =============

export class PointsMesh extends BaseMesh {
    static options() {
        return {
            pointSize: 1,
            color: null,
            z: 2.0,
        }
    }
    init() {
        if (this.mesh) this.dispose()
        const pointSize = this.options.pointSize // REMIND: variable or fixed?
        this.fixedColor = this.options.color
            ? this.options.color //new  THREE.Color(this.options.color)
            : null

        const geometry = new THREE.BufferGeometry()
        geometry.addAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(), 3)
        )
        if (!this.fixedColor) {
            geometry.addAttribute(
                'color',
                new THREE.BufferAttribute(new Float32Array(), 3)
            )
        }

        const material = this.fixedColor
            ? new THREE.PointsMaterial({
                  size: pointSize,
                  color: this.fixedColor,
              })
            : new THREE.PointsMaterial({
                  size: pointSize,
                  vertexColors: THREE.VertexColors,
              })

        this.mesh = new THREE.Points(geometry, material)
        this.mesh.position.z = this.options.z
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
            if (!z) z = 0
            vertices.push(x, y, z)
            if (colors) colors.push(...viewFcn(turtle, i).color)
        })
        const positionAttrib = this.mesh.geometry.getAttribute('position')
        positionAttrib.setArray(new Float32Array(vertices))
        positionAttrib.needsUpdate = true
        if (colors) {
            const colorAttrib = this.mesh.geometry.getAttribute('color')
            colorAttrib.setArray(new Float32Array(colors))
            colorAttrib.needsUpdate = true
        }
    }
}

// ============= LinksMesh =============

export class LinksMesh extends BaseMesh {
    static options() {
        return {
            color: null,
            z: 1.5,
        }
    }
    init() {
        if (this.mesh) this.dispose()
        this.fixedColor = this.options.color
            ? new THREE.Color(this.options.color)
            : null

        const geometry = new THREE.BufferGeometry()
        geometry.addAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(), 3)
        )
        if (!this.fixedColor) {
            geometry.addAttribute(
                'color',
                new THREE.BufferAttribute(new Float32Array(), 3)
            )
        }

        const material = this.fixedColor
            ? new THREE.LineBasicMaterial({ color: this.fixedColor })
            : new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors })

        this.mesh = new THREE.LineSegments(geometry, material)
        this.mesh.position.z = this.options.z
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
                const color = viewFcn(link, i).color
                colors.push(...color, ...color)
            }
        })
        const positionAttrib = this.mesh.geometry.getAttribute('position')
        positionAttrib.setArray(new Float32Array(vertices))
        positionAttrib.needsUpdate = true
        if (colors) {
            const colorAttrib = this.mesh.geometry.getAttribute('color')
            colorAttrib.setArray(new Float32Array(colors))
            colorAttrib.needsUpdate = true
        }
    }
}

export default {
    BaseMesh,
    CanvasMesh,
    PatchesMesh,
    QuadSpritesMesh,
    PointsMesh,
    LinksMesh,
}
