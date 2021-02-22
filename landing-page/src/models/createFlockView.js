import FlockModel from '../../agentscript/models/FlockModel.js'
import TwoDraw from '../../agentscript/src/TwoDraw.js'

export const createFlockView = () => {
    let viewportWidth = window.innerWidth
    let viewportHeight = window.innerHeight
    let patchSize = 10
    let numPatchesWide = Math.ceil(viewportWidth / patchSize)
    let numPatchesTall = Math.ceil(viewportHeight / patchSize)

    let canvas = document.createElement('canvas')

    class LandingPageFlockModel extends FlockModel {
        constructor(worldOpts) {
            super(worldOpts)
            this.population = 50
            this.speed = 0.75
        }
    }

    const model = new LandingPageFlockModel({
        minX: 0,
        maxX: numPatchesWide,
        minY: 0,
        maxY: numPatchesTall
    })
    
    model.setup()

    const view = new TwoDraw(model, {
        div: canvas,
        patchSize: 10,
        useSprites: true
    }, {
        patchesColor: 'white',
        turtlesSize: 10
    })

    return view
}