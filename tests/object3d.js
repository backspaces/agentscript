import { Object3D } from '../dist/Object3D.esm.js'

const degToRad = degrees => degrees * (Math.PI / 180)
const radToDeg = radians => radians * (180 / Math.PI)

export default class YPR {
    constructor() {
        this.obj3d = new Object3D()
        this.obj3d.rotation.order = 'ZYX'
    }
    obj3d() {
        return this.obj3d
    }
    reset() {
        this.obj3d.position.set(0, 0, 0)
        this.obj3d.rotation.set(0, 0, 0)
    }

    // Reporters
    // x,y,z position in world coords
    position() {
        return this.obj3d.position.toArray()
    }
    setPosition(x, y, z) {
        this.obj3d.position.set(x, y, z)
    }
    // obj3d.rotation in 'ZYX' order. Defaults to radians, pass true for degrees
    rotation(degrees = false) {
        const { x, y, z } = this.obj3d.rotation // .reorder('ZYX')
        const rot = [x, y, z]
        return degrees ? rot.map(rad => radToDeg(rad)) : rot
    }
    // rotation in degrees, in z,y,x (ypr) order
    yawPitchRoll() {
        return this.rotation(true).reverse()
    }

    // NL reporters, yaw ~ heading, in degrees rather than radians.
    yaw() {
        return radToDeg(this.obj3d.rotation.z)
    }
    pitch() {
        return radToDeg(this.obj3d.rotation.y)
    }
    roll() {
        return radToDeg(this.obj3d.rotation.x)
    }

    // Transformations: Rotations in degrees around x,y,z axes
    // Equvalent to obj3d.rotateX/Y/Z but with degrees converted to radians
    // Use obj3d.rotateX/Y/Z(rads) to work in trig, see "facexyz" below
    rotateX(deg) {
        this.obj3d.rotateX(degToRad(deg))
    }
    rotateY(deg) {
        this.obj3d.rotateY(degToRad(deg))
    }
    rotateZ(deg) {
        this.obj3d.rotateZ(degToRad(deg))
    }
    // Rotations using NL names
    right(deg) {
        this.rotateZ(-deg)
    }
    left(deg) {
        this.rotateZ(deg)
    }
    tiltUp(deg) {
        this.rotateY(-deg)
    }
    tiltDown(deg) {
        this.rotateY(deg)
    }
    rollRight(deg) {
        this.rotateX(deg)
    }
    rollLeft(deg) {
        this.rotateX(-deg)
    }
    // Rotation toward a point
    facexyz(tx, ty, tz) {
        const [x, y, z] = this.position()
        const [dx, dy, dz] = [tx - x, ty - y, tz - z]
        const xyhypot = Math.hypot(dx, dy)
        const headingTowards = Math.atan2(dy, dx)
        const pitchTowards = Math.atan2(dz, xyhypot)

        this.obj3d.rotation.set(0, 0, 0)
        this.obj3d.rotateZ(headingTowards)
        this.obj3d.rotateY(-pitchTowards)
    }
    face(agent) {
        const { x, y, z } = agent
        this.face(x, y, z)
    }

    // Move along the X axis
    forward(d) {
        this.obj3d.translateX(d)
    }
    backward(d) {
        this.obj3d.translateX(-d)
    }

    // Utils
    // Round num or array of nums to a fractional precision of digits
    precision(num, digits = 4) {
        if (Array.isArray(num))
            return num.map(val => this.precision(val, digits))
        const mult = 10 ** digits
        return Math.round(num * mult) / mult
    }
}
