import Turtle from './Turtle.js'
import { Object3D } from '../vendor/Object3D.esm.js'
import * as util from './utils.js'

export default class Turtle3D extends Turtle {
    static defaultVariables() {
        return {
            atEdge: 'wrap',
        }
    }
    // Initialize a Turtle given its Turtles AgentSet.
    constructor() {
        super()
        Object.assign(this, Turtle3D.defaultVariables())
        // this.obj3d = new Object3D()
        // this.obj3d.rotation.order = 'ZYX'
        // this.reset()
    }
    // Called by ctor factory for each new agent.
    // constructor above called only once per agentset due to two-headed agents.
    agentConstructor() {
        this.obj3d = new Object3D()
        this.obj3d.rotation.order = 'ZYX'
        this.reset()
    }
    reset() {
        this.obj3d.position.set(0, 0, 0)
        this.obj3d.rotation.set(0, 0, 0)
    }

    setxyz(x, y, z) {
        super.setxy(x, y, z)
        // this.obj3d.position.set(x, y, z)
    }
    getxyz() {
        return this.obj3d.position.toArray()
    }
    setRotation(x, y, z) {
        this.obj3d.rotation.set(x, y, z)
        this.theta = this.obj3d.rotation.z
    }
    getRotation() {
        const { x, y, z } = this.obj3d.rotation // .reorder('ZYX')
        return [x, y, z]
    }
    getThetaPhiPsi() {
        return this.getRotation().reverse()
    }
    getHeadingPitchRoll() {
        const [psi, phi, theta] = this.getRotation()
        const heading = util.radToHeading(theta)
        const pitch = util.radToDeg(-phi)
        const roll = util.radToDeg(psi)
        return [heading, pitch, roll]
    }
    getDxDyDz() {
        return [this.dx, this.dy, this.dz]
    }
    // REMIND: temporary.
    // handleEdge(x, y, z) {
    //     super.handleEdge(x, y, z)
    //     this.setxyz(this.x, this.y, this.z)
    // }

    get x() {
        return this.obj3d.position.x
    }
    set x(d) {
        this.obj3d.position.x = d
    }
    get y() {
        return this.obj3d.position.y
    }
    set y(d) {
        this.obj3d.position.y = d
    }
    get z() {
        return this.obj3d.position.z
    }
    set z(d) {
        this.obj3d.position.z = d
    }

    get theta() {
        return this.obj3d.rotation.z
    }
    set theta(rad) {
        this.obj3d.rotation.z = rad
    }
    get pitch() {
        return -this.obj3d.rotation.y
    }
    set pitch(rad) {
        this.obj3d.rotation.y = -rad
    }
    get roll() {
        return this.obj3d.rotation.x
    }
    set roll(rad) {
        this.obj3d.rotation.x = rad
    }

    // Move along the turtle's X axis
    forward(d) {
        const p0 = this.patch
        this.obj3d.translateX(d)
        super.checkXYZ(p0)
        // let [x, y, z] = this.getxyz()
        // super.setxy(x, y, z)
    }

    // Also used by turtles.create()
    // setTheta(rad) {
    //     this.obj3d.rotateZ(rad)
    // }

    // Incremental rotation around given axis
    right(rad) {
        this.obj3d.rotateZ(-rad)
        // this.theta = this.obj3d.rotation.z
    }
    left(rad) {
        this.right(-rad)
    }
    tiltUp(rad) {
        this.obj3d.rotateY(-rad)
    }
    tiltDown(rad) {
        this.tiltUp(-rad)
    }
    rollRight(rad) {
        this.obj3d.rotateX(rad)
    }
    rollLeft(rad) {
        this.rollRight(-rad)
    }

    facexyz(x1, y1, z1) {
        const headingTowards = this.towardsXY(x1, y1)
        const pitchTowards = this.towardsPitchXYZ(x1, y1, z1)

        // const roll = this.roll
        // this.obj3d.rotation.set(0, 0, 0)
        this.theta = headingTowards
        this.pitch = pitchTowards
        // this.roll = roll
    }
    face(agent) {
        const { x, y, z } = agent
        this.facexyz(x, y, z)
    }
    towardsPitchXYZ(x1, y1, z1) {
        const [x, y, z] = this.getxyz()
        const [dx, dy, dz] = [x1 - x, y1 - y, z1 - z]
        const xyhypot = Math.hypot(dx, dy)
        // const headingTowards = Math.atan2(dy, dx)
        // const pitchTowards = Math.atan2(dz, xyhypot)
        return Math.atan2(dz, xyhypot)
    }
    towardsPitch(agent) {
        const { x, y, z } = agent
        this.towardsPitchXYZ(x, y, z)
    }

    distance(agent) {
        const { x, y, z } = agent
        return this.distanceXYZ(x, y, z)
    }
    distanceXYZ(x1, y1, z1) {
        const { x, y, z } = this
        return util.distance3(x, y, z, x1, y1, z1)
    }

    // From https://ccl.northwestern.edu/netlogo/docs/
    // Note: dx is simply the sine of the turtle's heading, and dy is simply the cosine. (If this is the reverse of what you expected, it's because in NetLogo a heading of 0 is north and 90 is east, which is the reverse of how angles are usually defined in geometry.)
    // Note: In earlier versions of NetLogo, these primitives were used in many situations where the new patch-ahead primitive is now more appropriate.
    // NOTE: dz is simply the sine of the turtle's pitch. Both dx and dy have changed in this case. So, dx = cos(pitch) * sin(heading) and dy = cos(pitch) * cos(heading).

    get dx() {
        const { pitch, theta } = this
        return Math.cos(pitch) * Math.cos(theta)
    }
    get dy() {
        const { pitch, theta } = this
        return Math.cos(pitch) * Math.sin(theta)
    }
    get dz() {
        return Math.sin(this.pitch)
    }
}
