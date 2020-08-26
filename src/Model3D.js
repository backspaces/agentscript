// import World from './World.js'
// import Patches from './Patches.js'
// import Patch from './Patch.js'
// import Turtles from './Turtles.js'
// import Turtle from './Turtle.js'
// import Links from './Links.js'
// import Link from './Link.js'
import Turtle3D from './Turtle3D.js'
import Model from './Model.js'

export default class Model3D extends Model {
    initAgentSet(name, AgentsetClass, AgentClass) {
        if (name === 'turtles') AgentClass = Turtle3D
        super.initAgentSet(name, AgentsetClass, AgentClass)
    }

    // resetModel(worldOptions) {
    //     // const initAgentSet = (name, AgentsetClass, AgentClass) => {
    //     //     this[name] = new AgentsetClass(this, AgentClass, name)
    //     // }
    //     this.ticks = 0
    //     this.world =
    //         worldOptions.maxXcor === undefined
    //             ? new World(worldOptions)
    //             : worldOptions
    //     // Base AgentSets setup here. Breeds handled by setup
    //     this.initAgentSet('patches', Patches, Patch)
    //     this.initAgentSet('turtles', Turtles, Turtle)
    //     this.initAgentSet('links', Links, Link)
    // }

    // Breeds: create breeds/subarrays of Patches, Agents, Links
    // patchBreeds(breedNames) {
    //     for (const breedName of breedNames.split(' ')) {
    //         this[breedName] = this.patches.newBreed(breedName)
    //     }
    // }
    // turtleBreeds(breedNames) {
    //     for (const breedName of breedNames.split(' ')) {
    //         this[breedName] = this.turtles.newBreed(breedName)
    //     }
    // }
    // linkBreeds(breedNames) {
    //     for (const breedName of breedNames.split(' ')) {
    //         this[breedName] = this.links.newBreed(breedName)
    //     }
    // }
}
