import HelloModel from '/models/HelloModel.js'
import World from '/src/World.js'

// We use a simple HelloModel subclass
export default class ShapesModel extends HelloModel {
    population = 100 // override HelloModel's population & linkstoo
    linksToo = false

    constructor(worldOptions = World.defaultOptions(16)) {
        super(worldOptions)
    }
}
