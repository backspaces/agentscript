import * as util from '../src/utils.js'
import * as gis from '../src/gis.js'
import World from '../src/World.js'
import Model from '../src/Model.js'
import { lineStringsToLinks } from '../src/geojson.js'

// The json data is pre-computed due to being very difficult to compute here.
// Thus done offline via node/deno cli's
const xyz = [3370, 6451, 14]
const bbox = gis.xyz2bbox(...xyz)
// const jsonUrl = './data/santafe14roads.json'
const jsonUrl = '../models/data/santafe14roads.json'
// const jsonUrl = import.meta.resolve('../models/data/santafe14roads.json')

// console.log(bbox.toString())

export default class RoadsModel extends Model {
    geojson
    network
    numDrivers = 100 // 25
    speed = 0.05
    speedDelta = 0.05

    constructor(worldOptions = World.defaultOptions(100)) {
        super(worldOptions)
    }

    async startup() {
        const url = import.meta.resolve(jsonUrl)
        this.geojson = await fetch(url).then(resp => resp.json())
        // this.geojson = await fetch(jsonUrl).then(resp => resp.json())
    }

    setup() {
        this.turtleBreeds('intersections nodes drivers')
        // REMIND: this fails! this.nodes.setDefault('atEdge', 'clamp')
        this.turtles.setDefault('atEdge', 'clamp')

        this.network = lineStringsToLinks(this, bbox, this.geojson)
        // console.log(this.network)

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
        // this.drivers.ask(t => {
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
        // })
    }
}
