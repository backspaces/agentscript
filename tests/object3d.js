import { Object3D } from '../vendor/Object3D.esm.js'
export { Object3D }

const PI = Math.PI
const radians = degrees => degrees * (PI / 180)
const degrees = radians => radians * (180 / PI)
function precision(num, digits = 4) {
    const mult = 10 ** digits
    return Math.round(num * mult) / mult
}
const p2 = num => precision(num, 2)
const p4 = num => precision(num, 4)

export class YPR {
    constructor() {
        this.obj3d = new Object3D()
    }
    obj3d() {
        return this.obj3d
    }
    reset() {
        this.obj3d.position.set(0, 0, 0)
        this.obj3d.rotation.set(0, 0, 0)
    }

    position() {
        return this.obj3d.position.toArray().map(p => p2(p))
    }
    rotation() {
        return this.eulerDegrees().map(p => p2(p))
    }
    ypr() {
        return this.rotation().reverse()
    }

    // ypr() {
    //     return this.eulerDegrees()
    //         .reverse()
    //         .map(deg => p2(deg))
    // }

    euler() {
        const { x, y, z } = this.obj3d.rotation.reorder('ZYX')
        return [x, y, z]
    }
    eulerDegrees() {
        const rads = this.euler()
        return rads.map(r => degrees(r))
    }

    rotx(deg) {
        this.obj3d.rotateX(radians(deg))
    }
    roty(deg) {
        this.obj3d.rotateY(radians(deg))
    }
    rotz(deg) {
        this.obj3d.rotateZ(radians(deg))
    }

    right(deg) {
        this.rotz(-deg)
    }
    left(deg) {
        this.rotz(deg)
    }
    tiltUp(deg) {
        this.roty(-deg)
    }
    tiltDown(deg) {
        this.roty(deg)
    }
    rollRight(deg) {
        this.rotx(deg)
    }
    rollLeft(deg) {
        this.rotx(-deg)
    }

    yaw() {
        return this.eulerDegrees()[2]
    }
    pitch() {
        return this.eulerDegrees()[1]
    }
    roll() {
        return this.eulerDegrees()[0]
    }

    forward(d) {
        this.obj3d.translateX(d)
    }
    backward(d) {
        this.obj3d.translateX(-d)
    }
    face(tx, ty, tz) {
        const [x, y, z] = this.position()
        // const { x: tx, y: ty, z: tz } = target.position
        const [dx, dy, dz] = [tx - x, ty - y, tz - z]
        const xyhypot = Math.hypot(dx, dy)
        const headingTowards = Math.atan2(dy, dx)
        const pitchTowards = Math.atan2(dz, xyhypot)

        this.obj3d.rotation.set(0, 0, 0)
        this.obj3d.rotateZ(headingTowards)
        this.obj3d.rotateY(-pitchTowards)
    }
}
