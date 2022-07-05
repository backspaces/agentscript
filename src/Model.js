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

// import Model2D from '../src/Model2D.js'
// import Turtle3D from '../src/Turtle3D'
// /** @class */

// class Model extends Model2D {
//     use3D() {
//         return !(this.world.minZ === 0 && this.world.maxZ === 0)
//     }
//     initAgentSet(name, AgentsetClass, AgentClass) {
//         if (name === 'turtles' && this.use3D()) AgentClass = Turtle3D
//         super.initAgentSet(name, AgentsetClass, AgentClass)
//     }
// }

// export default Model

// ======================================
// Try AsyncFunction?? top level await?
// class Model extends Model2D {
//     use3D() {
//         return !(this.world.minZ === 0 && this.world.maxZ === 0)
//     }
//     initAgentSet(name, AgentsetClass, AgentClass) {
//         if (name === 'turtles' && this.use3D()) AgentClass = Turtle3D
//         super.initAgentSet(name, AgentsetClass, AgentClass)
//     }
// }

// export default Model
