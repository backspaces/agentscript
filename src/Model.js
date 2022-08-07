import Model from './Model3D.js'
/** @class */

/**
 * This is our default Model which simply re-exports Model3D
 * Thus when using:
 *
 * import Model from './Model.js'
 *
 * ..you will be using ./Model3D
 *
 * @param {Object|World} [worldOptions=World.defaultOptions()]
 *  Identical to {@link Model3D}
 */

export default Model

// ======================================

// import Turtle3D from './Turtle3D.js'
// import Model2D from './Model2D.js'
// /** @class */

// class Model extends Model2D {
//     // For 3D: right after myModel = new Model(worldOptions)
//     // call myModel.setUse3D(true)
//     use3D = false

//     setUse3D(use3D) {
//         this.use3D = use3D
//         this.resetModel(this.world)
//     }
//     initAgentSet(name, AgentsetClass, AgentClass) {
//         if (name === 'turtles' && this.use3D) AgentClass = Turtle3D
//         super.initAgentSet(name, AgentsetClass, AgentClass)
//     }
// }

// export default Model

// ======================================

// // This works! But primarily for GeoWorld models.
// // And would fail to catch standard 2.5D models which are fine
// // with Model2D which accepts z values.

// import Turtle3D from './Turtle3D.js'
// import Model2D from './Model2D.js'
// /** @class */

// class Model extends Model2D {
//     use3D() {
//         // return !(this.world.minZ === 0 && this.world.maxZ === 0)
//         return this.world.constructor.name !== 'GeoWorld'
//     }
//     initAgentSet(name, AgentsetClass, AgentClass) {
//         if (name === 'turtles' && this.use3D()) AgentClass = Turtle3D
//         super.initAgentSet(name, AgentsetClass, AgentClass)
//     }
// }

// export default Model

// ======================================
