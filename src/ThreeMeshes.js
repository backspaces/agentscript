// Meshes used by the Three.js view module

// import THREE from '../dist/three.wrapper.js'
// import * as THREE from '../node_modules/three/build/three.module.js'
import { THREE } from '../dist/vendor.esm.js'

// Utility classes meant to be subclassed:
// ============= BaseMesh =============
// An abstract class for all Meshes.
export class BaseMesh {
    // static options(): https://goo.gl/sKdxoY
    constructor(view, options = this.constructor.options()) {
        const { scene, world } = view
        Object.assign(this, { scene, world, view, options })
        this.mesh = null
        this.name = this.constructor.name
        // this.fixedColor = options.color
        // this.fixedSize = options.pointSize
        // this.fixedShape =
        //     this.name === 'PatchesMesh'
        //         ? 'Patch'
        //         : this.name === 'PointsMesh'
        //             ? 'Point'
        //             : this.name === 'LinksMesh'
        //                 ? 'Link'
        //                 : undefined
        this.useSprites = this.name.match(/sprites/i) != null
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

    // Utilities
    createQuad(r, z = 0) {
        // r is radius of xy quad: [-r,+r], z is quad z
        const vertices = [-r, -r, z, r, -r, z, r, r, z, -r, r, z]
        const indices = [0, 1, 2, 0, 2, 3]
        return { vertices, indices }
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
    init(canvas, useSegments = false) {
        if (this.mesh) this.dispose()
        const { textureOptions, z } = this.options
        Object.assign(this, { canvas, z, textureOptions })
        const { width, height, centerX, centerY } = this.world

        const texture = new THREE.CanvasTexture(canvas)
        for (const key in textureOptions) {
            texture[key] = textureOptions[key]
        }

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
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            transparent: true,
        })

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.z = z
        this.scene.add(this.mesh)
    }
    update() {
        // REMIND: have canvas owner set a flag
        this.mesh.material.map.needsUpdate = true
    }
}

// Several classes for patches, turtles, links, etc.

// ============= DrawingMesh =============

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
    static options() {
        return {
            textureOptions: {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
            },
            z: 1.0,
        }
    }
    init(canvas) {
        // this.patchesView = new PatchesView(world.width, world.height)
        // REMIND: pass in patches instead of canvas
        // super.init(this.patchesView.canvas)
        super.init(canvas)
    }
    update(patches) {
        // patches.installPixels()
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
    constructor(view, options) {
        super(view, options)
        this.unitQuad = this.createQuad(0.5, 0)
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
            // side: THREE.DoubleSide,
        })

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.z = this.options.z
        this.scene.add(this.mesh)
    }
    // update takes any array of objects with x,y,z,size,sprite .. position & uvs
    // REMIND: optimize by flags for position/uvs need updates
    update(turtles) {
        const mesh = this.mesh
        const { vertices, indices } = this.unitQuad
        const positionAttrib = mesh.geometry.getAttribute('position')
        const uvAttrib = mesh.geometry.getAttribute('uv')
        const indexAttrib = mesh.geometry.getIndex()
        const positions = new Float32Array(vertices.length * turtles.length)
        const uvs = []
        const indexes = []

        for (let i = 0; i < turtles.length; i++) {
            const turtle = turtles[i]
            // if (turtle.sprite.needsUpdate) turtle.setSprite()
            // if (!turtle.sprite) turtle.setSprite()
            const size = turtle.size
            const theta = turtle.theta
            const cos = Math.cos(theta)
            const sin = Math.sin(theta)
            const offset = i * vertices.length

            for (let j = 0; j < vertices.length; j = j + 3) {
                const x0 = vertices[j]
                const y0 = vertices[j + 1]
                const x = turtle.x
                const y = turtle.y
                positions[j + offset] = size * (x0 * cos - y0 * sin) + x
                positions[j + offset + 1] = size * (x0 * sin + y0 * cos) + y
                positions[j + offset + 2] = turtle.z
            }
            indexes.push(...indices.map(ix => ix + i * 4)) // 4
            uvs.push(...turtle.sprite.uvs)
        }
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
        const pointSize = this.options.pointSize // REMIND
        const color = this.options.color
            ? new THREE.Color(this.options.color)
            : null

        const geometry = new THREE.BufferGeometry()
        geometry.addAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(), 3)
        )
        if (color == null) {
            geometry.addAttribute(
                'color',
                new THREE.BufferAttribute(new Float32Array(), 3)
            )
        }

        const material = color
            ? new THREE.PointsMaterial({ size: pointSize, color: color })
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
    update(turtles) {
        const positionAttrib = this.mesh.geometry.getAttribute('position')
        // const positionBuff = positionAttrib.array
        const colorAttrib = this.mesh.geometry.getAttribute('color')
        const vertices = []
        const colors = colorAttrib == null ? null : []

        // const red = [1, 0, 0] // REMIND: add color/shape to turtles

        for (let i = 0; i < turtles.length; i++) {
            const { x, y, z, color } = turtles[i]
            vertices.push(x, y, z)
            // if (colors != null) colors.push(...red)
            if (colors != null) colors.push(...color.webgl)
        }
        positionAttrib.setArray(new Float32Array(vertices))
        positionAttrib.needsUpdate = true
        if (colors) {
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
        const color = this.options.color
            ? new THREE.Color(this.options.color)
            : null

        const geometry = new THREE.BufferGeometry()
        geometry.addAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(), 3)
        )
        if (color == null) {
            geometry.addAttribute(
                'color',
                new THREE.BufferAttribute(new Float32Array(), 3)
            )
        }

        const material = color
            ? new THREE.LineBasicMaterial({ color: color })
            : new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors })
        // const material = color
        // ? new THREE.PointsMaterial({size: pointSize, color: color})
        // : new THREE.PointsMaterial({size: pointSize, vertexColors: THREE.VertexColors})

        this.mesh = new THREE.LineSegments(geometry, material)
        this.mesh.position.z = this.options.z
        this.scene.add(this.mesh)
    }
    // update takes any array of objects with color & end0, end1 having x,y,z
    // REMIND: optimize by flags for position/uvs need updates
    update(links) {
        const vertices = []
        const colors = this.options.color ? null : []
        for (let i = 0; i < links.length; i++) {
            const { x0, y0, z0, x1, y1, z1 } = links[i]
            vertices.push(x0, y0, z0, x1, y1, z1)
            if (colors) {
                const color = links[i].color
                colors.push(...color, ...color)
            }
        }
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

/*

- PlaneGeometry: switch to PlaneBufferGeometry
- make resize work
- test non centered world


*/
