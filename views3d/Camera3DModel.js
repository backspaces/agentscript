import * as util from '../src/utils.js'
import Model from '../src/Model3D.js'

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
        // this.links.setDefault('hidden', true)

        this.camera = this.cameras.createOne()

        for (const y of util.range(this.height)) {
            for (const x of util.range(this.width)) {
                this.pixels.createOne(px => {
                    px.u = (x / this.width) * 2 - 1
                    px.v = (y / this.height) * 2 - 1
                })
            }
        }

        // this.pixels.ask(px => this.links.createOne(px, this.camera))

        this.moveCamera()
    }

    toggleLinks() {
        // this.links.setDefault('hidden', !this.links.getDefault('hidden'))
        if (this.links.length === 0) {
            this.pixels.ask(px => this.links.createOne(px, this.camera))
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

        this.pixels.ask(px => {
            px.moveTo(this.camera)

            px.heading = this.camera.heading
            px.pitch = this.camera.pitch
            px.roll = this.camera.roll

            px.right((px.u * this.fieldOfView) / 2)
            px.tiltUp((px.v * this.fieldOfView) / 2 / aspectRatio)

            px.forward(this.sphereRadius)
        })
    }
}
