import Turtle2D from './Turtle2D.js'
import Model from './Model.js'

export default class Model2D extends Model {
    initAgentSet(name, AgentsetClass, AgentClass) {
        if (name === 'turtles') AgentClass = Turtle2D
        super.initAgentSet(name, AgentsetClass, AgentClass)
    }
}
