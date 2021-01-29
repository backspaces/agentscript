import * as util from '../src/utils.js'
import Model3D from '../src/Model3D.js'

const toRad = Math.PI / 180

export default class Camera3DModel extends Model3D {
    static defaultOptions() {
        return {
            width: 32,
            height: 24,
            sphereRadius: 8,
            pan: 0,
            tilt: 0,
            roll: 0,
            fieldOfView: 90,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, Camera3DModel.defaultOptions())
    }
    setup() {
        this.turtleBreeds('cameras pixels')

        this.camera = this.cameras.createOne()

        for (const y of util.range(this.height)) {
            for (const x of util.range(this.width)) {
                this.pixels.createOne(p => {
                    p.u = (x / this.width) * 2 - 1
                    p.v = (y / this.height) * 2 - 1
                })
            }
        }

        this.moveCamera()
    }

    toggleLinks() {
        if (this.links.length === 0) {
            this.pixels.ask(p => this.links.createOne(p, this.camera))
        } else {
            this.links.clear()
        }
    }
    reset() {
        Object.assign(this, Camera3DModel.defaultOptions())
        this.moveCamera()
    }

    step() {
        // No-op for now, dat.gui manipulates the scene
    }

    moveCamera() {
        const aspectRatio = this.width / this.height

        this.camera.theta = this.pan * toRad
        this.camera.pitch = this.tilt * toRad
        this.camera.roll = this.roll * toRad

        this.pixels.ask(p => {
            p.moveTo(this.camera)

            p.roll = this.camera.roll
            p.theta = this.camera.theta
            p.pitch = this.camera.pitch

            p.right((p.u * this.fieldOfView * toRad) / 2)
            p.tiltUp((p.v * this.fieldOfView * toRad) / 2 / aspectRatio)

            p.forward(this.sphereRadius)
        })
    }
}
