// import Model from './Model3D.js'
// /** @class */

// /**
//  * This is our default Model which simply re-exports Model3D
//  * Thus when using:
//  *
//  * import Model from './Model.js'
//  *
//  * ..you will be using ./Model3D
//  *
//  * @param {Object|World} [worldOptions=World.defaultOptions()]
//  *  Identical to {@link Model3D}
//  */

// export default Model

// ======================================

import Turtle3D from './Turtle3D.js'
import Model2D from './Model2D.js'
/** @class */

class Model extends Model2D {
    use3D() {
        return !(this.world.minZ === 0 && this.world.maxZ === 0)
    }
    initAgentSet(name, AgentsetClass, AgentClass) {
        if (name === 'turtles' && this.use3D()) AgentClass = Turtle3D
        super.initAgentSet(name, AgentsetClass, AgentClass)
    }
}

export default Model

// ======================================

// Model3D:
// import Turtle3D from './Turtle3D.js'
// import Model2D from './Model2D.js'

// /**
//  * Model3D uses Model2D with one change:
//  *
//  * - model.Turtles: an array {@link Turtles} of {@link Turtle3D} instances
//  *
//  * Model3D is our default Model.
//  *
//  * @param {Object|World} [worldOptions=World.defaultOptions()]
//  *
//  */
// class Model3D extends Model2D {
//     initAgentSet(name, AgentsetClass, AgentClass) {
//         if (name === 'turtles') AgentClass = Turtle3D
//         super.initAgentSet(name, AgentsetClass, AgentClass)
//     }
// }

// export default Model3D

// ======================================
