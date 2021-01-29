// import ColorMap from '../src/ColorMap.js'
import Model from '../src/Model.js'
import * as util from '../src/utils.js'

export default class LinkTravelModel extends Model {
    static defaultOptions() {
        return {
            layoutCircle: true,
            numNodes: 30,
            numDrivers: 100,
            speed: 0.1,
            speedDelta: 0.1,
        }
    }

    // ======================

    constructor(worldDptions) {
        super(worldDptions) // default world options if "undefined"
        Object.assign(this, LinkTravelModel.defaultOptions())
    }

    setup() {
        this.turtleBreeds('nodes drivers')
        // this.nodes.setDefault('shape', 'circle')
        // this.nodes.setDefault('size', 0.3)
        // this.drivers.setDefault('size', 1.5)

        // this.refreshPatches = this.refreshLinks = false

        // if (!this.transparentPatches) {
        //     this.patches.ask(p => {
        //         p.color = ColorMap.LightGray.randomColor()
        //     })
        // }

        // Create the graph node turtles
        this.patches.nOf(this.numNodes).ask(p => {
            p.sprout(1, this.nodes, t => {
                if (this.nodes.length > 2) {
                    this.links.create(t, this.turtles.otherNOf(2, t))
                }
            })
        })

        if (this.layoutCircle) {
            this.nodes.layoutCircle(this.world.maxX - 1)
        }

        util.repeat(this.numDrivers, () => {
            const node = this.nodes.oneOf()
            node.hatch(1, this.drivers, driver => {
                driver.fromNode = node
                // note: linkNeighbors is a vanilla Array, not an AgentArray.
                driver.toNode = util.oneOf(node.linkNeighbors())
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
