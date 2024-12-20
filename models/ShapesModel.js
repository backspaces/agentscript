import HelloModel from 'https://code.agentscript.org/models/HelloModel.js'
import World from 'https://code.agentscript.org/src/World.js'

// We use a simple HelloModel subclass
export default class ShapesModel extends HelloModel {
    population = 100 // override HelloModel's population & linkstoo
    linksToo = false

    constructor(worldOptions = World.defaultOptions(16)) {
        super(worldOptions)
    }
}
