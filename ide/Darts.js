import HelloModel from 'https://code.agentscript.org/models/HelloModel.js'

export class Model extends HelloModel {
    population = 40 // number of turtles
    speed = 0.3 // step size in patch units
    wiggleAngle = 10 // wiggle angle in degrees
    linksToo = false // handy to show just turtles if false
    // name = 'Darts'
}

export const patchSize = 20

export const drawOptions = {
    turtlesSize: 4,
    patchesColor: 'white',
}

export default { Model, patchSize, drawOptions }
