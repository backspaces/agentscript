import Turtle3D from './Turtle3D.js'
import Model from './Model.js'

/**
 * Model3D uses Model with one change:
 *
 * - model.Turtles: an array {@link Turtles} of {@link Turtle3D} instances
 *
 * @param {Object|World} [worldOptions=World.defaultOptions()]
 *
 */
class Model3D extends Model {
    initAgentSet(name, AgentsetClass, AgentClass) {
        if (name === 'turtles') AgentClass = Turtle3D
        super.initAgentSet(name, AgentsetClass, AgentClass)
    }
}

export default Model3D
