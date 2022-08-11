import Turtle from './Turtle.js'
import { Object3D } from '../vendor/Object3D.js'
import * as util from './utils.js'

const { checkArg, checkArgs } = util

/**
 * Class Turtle3D subclasses  {@link Turtles}, adding 3D methods using
 * Three.js's Object3D module.
 * See [NetLogo](https://ccl.northwestern.edu/netlogo/docs/3d.html)
 * who's 3D semantics we follow.
 *
 * Just as with Turtle, you do not call `new Turtle3D()`,
 * instead class Turtles creates Turtle3D instances via
 * {@link Model} modifying the Turtles/Turtle3D initialization.
 *
 * Again, class Turtles is a factory for all of it's Turtle3D instances.
 * So *don't* do this:
 */

class Turtle3D extends Turtle {
    static defaultVariables() {
        return {
            atEdge: 'wrap',
            hidden: false,
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

    /**
     * Resets this turtle's position, rotation and heading all to 0's
     */
    reset() {
        this.obj3d.position.set(0, 0, 0)
        this.obj3d.rotation.set(0, 0, 0)
        this.heading = 0
        // this.pitch = 0
        // this.roll = 0
    }
    /**
     * Set's this turtle's 3D, x y z, position
     *
     * @param {number} x float for x position
     * @param {number} y float for y position
     * @param {number} z float for z position
     */
    setxyz(x, y, z) {
        checkArgs(arguments)
        super.setxy(x, y, z)
        // setxy sets this.x,y,z, includes us.
        // this.obj3d.position.set(x, y, z)
    }
    getxyz() {
        return this.obj3d.position.toArray()
    }
    setRotation(x, y, z) {
        checkArgs(arguments)
        this.obj3d.rotation.set(x, y, z)
        // super/this.theta = this.obj3d.rotation.z ????
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
        // return [this.heading, this.pitch, this.roll] // ????
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
        checkArg(d)
        this.obj3d.position.x = d
    }
    get y() {
        return this.obj3d.position.y
    }
    set y(d) {
        checkArg(d)
        this.obj3d.position.y = d
    }
    get z() {
        return this.obj3d.position.z
    }
    set z(d) {
        checkArg(d)
        this.obj3d.position.z = d
    }

    // Trap super's setting of theta
    get theta() {
        // util.warn('theta is deprecated, use heading instead')
        return this.obj3d.rotation.z
    }
    set theta(rad) {
        checkArg(rad)
        // util.warn('theta is deprecated, use heading instead')
        if (this.obj3d) this.obj3d.rotation.z = rad
    }

    get heading() {
        return this.model.fromRads(this.obj3d.rotation.z)
    }
    set heading(angle) {
        checkArg(angle)
        this.obj3d.rotation.z = this.model.toRads(angle)
    }
    get pitch() {
        // return -this.model.fromRads(this.obj3d.rotation.y)
        // return -this.model.fromAngleRads(this.obj3d.rotation.y)
        return -this.model.fromAngleRads(this.obj3d.rotation.y)
    }
    set pitch(angle) {
        checkArg(angle)
        // this.obj3d.rotation.y = -this.model.toRads(angle)
        // this.obj3d.rotation.y = -this.model.toAngleRads(angle)
        this.obj3d.rotation.y = -this.model.toAngleRads(angle)
    }
    get roll() {
        // return this.model.fromRads(this.obj3d.rotation.x)
        // return this.model.fromAngleRads(this.obj3d.rotation.x)
        return this.model.fromAngleRads(this.obj3d.rotation.x)
    }
    set roll(angle) {
        checkArg(angle)
        // this.obj3d.rotation.x = this.model.toRads(angle)
        // this.obj3d.rotation.x = this.model.toAngleRads(angle)
        this.obj3d.rotation.x = this.model.toAngleRads(angle)
    }

    // Move along the turtle's X axis
    forward(d) {
        checkArg(d)
        const p0 = this.patch
        this.obj3d.translateX(d)
        super.checkXYZ(p0)
        // let [x, y, z] = this.getxyz()
        // super.setxy(x, y, z)
    }

    // Incremental rotation around given axis
    right(angle) {
        this.left(-angle)
        // this.obj3d.rotateZ(-this.model.toAngleRads(angle))
        // this.theta = this.obj3d.rotation.z
    }
    left(angle) {
        checkArg(angle)
        this.obj3d.rotateZ(this.model.toAngleRads(angle))
        // this.right(-angle)
    }
    tiltUp(angle) {
        // this.obj3d.rotateY(-this.model.toAngleRads(angle))
        this.tiltDown(-angle)
    }
    tiltDown(angle) {
        checkArg(angle)
        this.obj3d.rotateY(this.model.toAngleRads(angle))
        // this.tiltUp(-angle)
    }
    rollRight(angle) {
        checkArg(angle)
        this.obj3d.rotateX(this.model.toAngleRads(angle))
    }
    rollLeft(angle) {
        this.rollRight(-angle)
    }

    facexyz(x1, y1, z1) {
        checkArgs(arguments)

        // const headingTowards = this.model.toRads(this.towardsXY(x1, y1))
        // const pitchTowards = this.model.toRads(this.towardsPitchXYZ(x1, y1, z1)

        const headingTowards = this.towardsXY(x1, y1)
        const pitchTowards = this.towardsPitchXYZ(x1, y1, z1)

        // const roll = this.roll
        // this.obj3d.rotation.set(0, 0, 0)
        this.heading = headingTowards
        this.pitch = pitchTowards
        // this.roll = roll
    }
    face(agent) {
        checkArg(agent, 'object')
        const { x, y, z } = agent
        this.facexyz(x, y, z)
    }
    towardsPitchXYZ(x1, y1, z1) {
        checkArgs(arguments)
        const [x, y, z] = this.getxyz()
        const [dx, dy, dz] = [x1 - x, y1 - y, z1 - z]
        const xyhypot = Math.hypot(dx, dy)
        const pitchRads = Math.atan2(dz, xyhypot)
        return this.model.fromAngleRads(pitchRads)
    }
    towardsPitch(agent) {
        checkArg(agent, 'object')
        const { x, y, z } = agent
        this.towardsPitchXYZ(x, y, z)
    }

    distance(agent) {
        checkArg(agent, 'object')
        const { x, y, z } = agent
        return this.distanceXYZ(x, y, z)
    }
    distanceXYZ(x1, y1, z1) {
        checkArgs(arguments)
        const { x, y, z } = this
        return util.distance3(x, y, z, x1, y1, z1)
    }

    // From https://ccl.northwestern.edu/netlogo/docs/
    // Note: dx is simply the sine of the turtle's heading, and dy is simply the cosine. (If this is the reverse of what you expected, it's because in NetLogo a heading of 0 is north and 90 is east, which is the reverse of how angles are usually defined in geometry.)
    // Note: In earlier versions of NetLogo, these primitives were used in many situations where the new patch-ahead primitive is now more appropriate.
    // NOTE: dz is simply the sine of the turtle's pitch. Both dx and dy have changed in this case. So, dx = cos(pitch) * sin(heading) and dy = cos(pitch) * cos(heading).

    get dx() {
        const { y: pitch, z: heading } = this.obj3d.rotation
        return Math.cos(pitch) * Math.cos(heading)
    }
    get dy() {
        const { y: pitch, z: heading } = this.obj3d.rotation
        return Math.cos(pitch) * Math.sin(heading)
    }
    get dz() {
        const pitch = this.obj3d.rotation.y
        return Math.sin(pitch)
    }
}

export default Turtle3D
