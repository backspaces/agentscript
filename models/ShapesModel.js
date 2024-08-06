import HelloModel from 'https://code.agentscript.org/models/HelloModel.js'
import World from 'https://code.agentscript.org/src/World.js'
// import * as util from 'https://code.agentscript.org/src/utils.js'

// Here is a simple modification that allows setting the population dynamically.
// Note that speed & wiggle are already dynamic.
export default class ShapesModel extends HelloModel {
    population = 100 // override HelloModel

    // ======================

    constructor(worldOptions = World.defaultOptions(25, 16)) {
        super(worldOptions)
    }

    step() {
        super.step()
    }
}
