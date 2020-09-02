import Turtle from './Turtle.js'
// import { radToDeg, degToRad } from './utils/math.js'
import { Object3D } from '../vendor/Object3D.esm.js'

export default class Turtle3D extends Turtle {
    static defaultVariables() {
        return {
            // // Core variables for turtles.
            // // turtle's position: x, y, z.
            // // Generally z set to constant via turtles.setDefault('z', num)
            // x: 0,
            // y: 0,
            // z: 0,
            // // my euclidean direction, radians from x axis, counter-clockwise
            // theta: null, // set to random if default not set by modeler
            // // What to do if I wander off world. Can be 'clamp', 'wrap'
            // // 'bounce', or a function, see handleEdge() method
            atEdge: 'wrap',
            // obj3d: null,
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
        this.obj3d.position.set(x, y, z)
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
    // REMIND: temporary.
    handleEdge(x, y, z) {
        // if (this.atEdge === 'bounce') {
        //     // const { minZcor, maxZcor } = this.model.world
        //     // if (z < minZcor)
        // }
        // console.log('phi', util.radToDeg(this.phi))
        super.handleEdge(x, y, z)
        this.setxyz(this.x, this.y, this.z)
    }

    // get x() {
    //     return this.obj3d.position.x
    // }
    // set x(d) {
    //     this.obj3d.position.x = d
    // }
    // get y() {
    //     return this.obj3d.position.y
    // }
    // set y(d) {
    //     this.obj3d.position.y = d
    // }
    // get z() {
    //     return this.obj3d.position.z
    // }
    // set z(d) {
    //     this.obj3d.position.z = d
    // }

    // get theta() {
    //     return this.obj3d.rotation.z
    // }
    // set theta(rad) {
    //     this.obj3d.rotation.z = rad
    // }
    // get direction() {
    //     return this.obj3d.rotation.z
    // }
    // set direction(rad) {
    //     this.obj3d.rotation.z = rad
    // }
    get phi() {
        return this.obj3d.rotation.y
    }
    set phi(rad) {
        this.obj3d.rotation.y = rad
    }

    // Move along the turtle's X axis
    forward(d) {
        this.obj3d.translateX(d)
        let [x, y, z] = this.getxyz()
        // Object.assign(this, { x, y, z })
        super.setxy(x, y, z)
    }

    // Also used by turtles.create()
    setTheta(rad) {
        this.obj3d.rotateZ(rad)
    }

    // Incremental rotation around given axis
    right(rad) {
        this.obj3d.rotateZ(-rad)
        this.theta = this.obj3d.rotation.z
    }
    left(rad) {
        this.right(-rad)
        // this.obj3d.rotateZ(rad)
        // this.theta = this.obj3d.rotation.z
    }
    tiltUp(rad) {
        this.obj3d.rotateY(-rad)
    }
    tiltDown(rad) {
        // this.obj3d.rotateY(rad)
        this.tiltUp(-rad)
    }
    rollRight(rad) {
        this.obj3d.rotateX(rad)
    }
    rollLeft(rad) {
        // this.obj3d.rotateX(-rad)
        this.rollRight(-rad)
    }

    facexyz(tx, ty, tz) {
        const [x, y, z] = this.getxyz()
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
        this.facexyz(x, y, z)
    }
}
