import Turtle3D from './Turtle3D.js'
import Model2D from './Model2D.js'

/**
 * Model3D uses Model2D with one change:
 *
 * - model.Turtles: an array {@link Turtles} of {@link Turtle3D} instances
 *
 * Model3D is our default Model.
 *
 * @param {Object|World} [worldOptions=World.defaultOptions()]
 * Identical to {@link Model2D}
 *
 */
export default class Model3D extends Model2D {
    initAgentSet(name, AgentsetClass, AgentClass) {
        if (name === 'turtles') AgentClass = Turtle3D
        super.initAgentSet(name, AgentsetClass, AgentClass)
    }
}
