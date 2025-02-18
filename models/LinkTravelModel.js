import Model from 'https://code.agentscript.org/src/Model.js'
import * as util from 'https://code.agentscript.org/src/utils.js'

export default class LinkTravelModel extends Model {
    layoutCircle = true
    numNodes = 30
    numDrivers = 100
    speed = 0.1
    speedDelta = 0.1

    // ======================

    // We can use Model's constructor, due to using Model's default World.
    // If you pass in world options, Model will use them
    // constructor() {
    //     super() // use default world options.
    // }

    setup() {
        this.turtleBreeds('nodes drivers')

        this.nodes.create(this.numNodes)

        // create two links per node to random other nodes.
        // two so that there is always an outgoing link other than the incomming one.
        this.nodes.ask(n => this.links.create(n, this.nodes.otherNOf(2, n)))

        if (this.layoutCircle) {
            this.nodes.layoutCircle(this.world.maxX - 1)
        } else {
            this.nodes.ask(n => n.moveTo(this.patches.oneOf()))
        }

        util.repeat(this.numDrivers, () => {
            const node = this.nodes.oneOf()
            node.hatch(1, this.drivers, driver => {
                driver.fromNode = node
                driver.toNode = node.linkNeighbors().oneOf()
                driver.face(driver.toNode)
                driver.speed = this.speed + util.randomFloat(this.speedDelta)
            })
        })
    }
    step() {
        this.drivers.ask(driver => {
            const moveBy = Math.min(
                driver.speed,
                driver.distance(driver.toNode)
            )
            driver.face(driver.toNode)
            driver.forward(moveBy)
            if (moveBy < driver.speed) {
                driver.fromNode = driver.toNode
                driver.toNode = util.oneOf(driver.toNode.linkNeighbors())
            }
        })
    }
}
