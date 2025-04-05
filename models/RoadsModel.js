import * as util from 'https://code.agentscript.org/src/utils.js'
import Model from '../src/Model.js'
import { lineStringsToLinks } from 'https://code.agentscript.org/src/geojson.js'
// import santafeRoads from './data/santafe14roads.json' with { type: 'json' }
import santafeRoads from './data/santaferoads.json' with { type: 'json' }
// import * as gis from '../src/gis.js'

// async function bbox2json(bboxOrJson){
//     if (gis.isBBox(bboxOrJson)) {
//         bboxOrJson = await gis.fetchStreetsJson(bboxOrJson)
//     }
//     return bboxOrJson
// }

export default class RoadsModel extends Model {
    // geojson //= santafeRoads
    network
    numDrivers = 100 // 25
    speed = 0.05
    speedDelta = 0.05

    // constructor(worldOptions = World.defaultOptions(100)) {
    constructor(worldOptions = { bbox: santafeRoads, patchesWidth: 201 }) {
        super(worldOptions)
        this.checkOptions(worldOptions)
    }

    checkOptions(options) {
        if (!(options.bbox && options.bbox.type === 'FeatureCollection')) {
            throw Error('RoadsModel: worldOptions.bbox must be geojson object')
        }
    }

    setup() {
        this.turtleBreeds('intersections nodes drivers')
        // REMIND: this fails! this.nodes.setDefault('atEdge', 'clamp')
        this.turtles.setDefault('atEdge', 'clamp')

        this.network = lineStringsToLinks(
            this,
            this.world.bbox,
            this.world.geojson
        )
        console.log('network', this.network)

        this.turtles.ask(t => {
            if (!this.world.isOnWorld(t.x, t.y)) {
                console.log('t offworld', t.x, t.y)
                t.die()
            }
        })
        this.turtles.ask(t => {
            if (t.links.length === 0) {
                console.log('t no links', t.id)
                t.die()
            }
        })

        this.turtles.ask(t => {
            this.nodes.setBreed(t)
            if (t.links.length > 2) this.intersections.setBreed(t)
        })

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

            // if moveBy was driver.distance, change to/from nodes
            if (moveBy < driver.speed) {
                const lastFromNode = driver.fromNode
                driver.fromNode = driver.toNode

                if (driver.toNode.links.length === 1) {
                    driver.toNode = lastFromNode
                } else {
                    const neighbors = driver.toNode.linkNeighbors()
                    driver.toNode = neighbors.otherOneOf(lastFromNode)
                }
            }
        })
    }
}
