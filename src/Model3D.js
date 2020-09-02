import Turtle3D from './Turtle3D.js'
import Model from './Model.js'

export default class Model3D extends Model {
    initAgentSet(name, AgentsetClass, AgentClass) {
        if (name === 'turtles') AgentClass = Turtle3D
        super.initAgentSet(name, AgentsetClass, AgentClass)
    }
}
