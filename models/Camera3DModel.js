import * as util from 'https://code.agentscript.org/src/utils.js'
import Model from 'https://code.agentscript.org/src/Model3D.js'

export default class Camera3DModel extends Model {
    width = 32
    height = 24
    sphereRadius = 12
    fieldOfView = 90

    // the camera's 3D orientation
    heading = 0
    pitch = 0
    roll = 0

    // used for animation of the camera in step()
    pitchDelta = 0
    rollDelta = 0
    headingDelta = 0

    // ======================

    // constructor(worldOptions) { // not needed
    //     super(worldOptions) // default world options if "undefined"
    // }

    setup() {
        this.turtleBreeds('cameras pixels')

        this.camera = this.cameras.createOne()

        for (const y of util.range(this.height)) {
            for (const x of util.range(this.width)) {
                this.pixels.createOne(px => {
                    px.u = (x / this.width) * 2 - 1
                    px.v = (y / this.height) * 2 - 1
                })
            }
        }

        this.moveCamera()
    }

    toggleLinks() {
        if (this.links.length === 0) {
            this.pixels.ask(px => this.links.createOne(px, this.camera))
        } else {
            this.links.clear()
        }
    }

    reset() {
        this.heading = this.pitch = this.roll = 0
        this.headingDelta = this.pitchDelta = this.rollDelta = 0
        this.sphereRadius = 12
        this.fieldOfView = 90
        this.links.clear()

        // this.moveCamera()
    }

    setHeadingPitchRoll(heading, pitch, roll) {
        this.heading = heading
        his.pitch = pitch
        this.roll = roll
    }

    setHeadingPitchRollDelta(headingDelta, pitchDelta, rollDelta) {
        this.headingDelta = headingDelta
        this.pitchDelta = pitchDelta
        this.rollDelta = rollDelta
    }

    step() {
        this.heading = util.mod180180(this.heading + this.headingDelta)
        this.pitch = util.mod180180(this.pitch + this.pitchDelta)
        this.roll = util.mod180180(this.roll + this.rollDelta)
        this.moveCamera()
    }

    moveCamera() {
        const aspectRatio = this.width / this.height

        this.camera.heading = this.heading
        this.camera.pitch = this.pitch
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
