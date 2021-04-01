import * as util from '../src/utils.js'
// import Model3D from '../src/Model3D.js'
import Model from '../src/Model.js'

export default class Camera3DModel extends Model {
    width = 32
    height = 24
    heading = 0
    tilt = 0
    roll = 0
    sphereRadius = 8
    fieldOfView = 90

    // ======================

    // constructor(worldDptions) { // not needed
    //     super(worldDptions) // default world options if "undefined"
    // }
    setup() {
        // this.setGeometry('degrees')
        // util.setGeometry(this, 'degrees')
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
        this.heading = this.tilt = this.roll = 0
        this.sphereRadius = 8
        this.fieldOfView = 90
        this.moveCamera()
    }

    step() {
        // No-op for now, dat.gui manipulates the scene
    }

    moveCamera() {
        const aspectRatio = this.width / this.height

        this.camera.heading = this.heading
        this.camera.pitch = this.tilt
        this.camera.roll = this.roll

        this.pixels.ask(p => {
            p.moveTo(this.camera)

            p.heading = this.camera.heading
            p.pitch = this.camera.pitch
            p.roll = this.camera.roll

            p.right((p.u * this.fieldOfView) / 2)
            p.tiltUp((p.v * this.fieldOfView) / 2 / aspectRatio)

            p.forward(this.sphereRadius)
        })
    }
}
