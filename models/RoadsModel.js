import * as util from 'https://code.agentscript.org/src/utils.js'
// import * as gis from 'https://code.agentscript.org/src/gis.js'
import * as gis from '../src/gis.js'

// import World from 'https://code.agentscript.org/src/World.js'
// import Model from 'https://code.agentscript.org/src/Model.js'
import Model from '../src/Model.js'

import { lineStringsToLinks } from 'https://code.agentscript.org/src/geojson.js'
import santafeRoads from './data/santafe14roads.json' with { type: 'json' }

// The json data is pre-computed due to being very difficult to compute here.
// Thus done offline via node/deno cli's
// const xyz = [3370, 6451, 14]
// const bbox = gis.xyz2bbox(...xyz)
// console.log('bbox', bbox)

export default class RoadsModel extends Model {
    // geojson //= santafeRoads
    network
    numDrivers = 100 // 25
    speed = 0.05
    speedDelta = 0.05

    // constructor(worldOptions = World.defaultOptions(100)) {
    constructor(worldOptions = { bbox: santafeRoads, patchesWidth: 201 }) {
        super(worldOptions)
        // console.log('worldOptions', worldOptions)
    }

    // async startup() {
    //     const url = import.meta.resolve(jsonUrl)
    //     this.geojson = await fetch(url).then(resp => resp.json())
    //     console.log('geojson:', this.geojson)

    //     // this.geojson = await fetch(jsonUrl).then(resp => resp.json())
    // }

    setup() {
        this.turtleBreeds('intersections nodes drivers')
        // REMIND: this fails! this.nodes.setDefault('atEdge', 'clamp')
        this.turtles.setDefault('atEdge', 'clamp')

        // const bbox = gis.jsonToBBox(this.world.geojson)
        // this.bbox = this.world.bbox
        // this.geojson = this.world.geojson
        this.network = lineStringsToLinks(this, this.world.bbox, this.world.geojson)
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
