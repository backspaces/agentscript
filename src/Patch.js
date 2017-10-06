import util from './util.js'
import Color from './Color.js'

// Class Patch instances represent a rectangle on a grid.  They hold variables
// that are in the patches the turtles live on.  The set of all patches
// is the world on which the turtles live and the model runs.

// Flyweight object creation:
// Objects within AgentSets use "prototypal inheritance" via Object.create().
// Here, the Patch class is given to Patches for use creating Proto objects
// (new Patch(agentSet)), but only once per model/breed.
// The flyweight Patch objects are created via Object.create(protoObject),
// This lets the new Patch(agentset) obhect be "defaults".
class Patch {
  static defaultVariables () { // Core variables for patches. Not 'own' variables.
    return {
      // id: null,             // unique id, promoted by agentset's add() method
      // agentSet: null,       // my agentset/breed
      // model: null,          // my model
      // patches: null,        // my patches/baseSet, set by ctor

      turtles: undefined,      // the turtles on me. Laxy evalued, see turtlesHere below
      labelOffset: [0, 0],  // text pixel offset from the patch center
      labelColor: Color.color(0, 0, 0) // the label color
      // Getter variables: label, color, x, y, neighbors, neighbors4
    }
  }
  // Initialize a Patch given its Patches AgentSet.
  constructor () {
    Object.assign(this, Patch.defaultVariables())
  }
  // Getter for x,y derived from patch id, thus no setter.
  get x () {
    return (this.id % this.model.world.numX) + this.model.world.minX
  }
  get y () {
    return this.model.world.maxY - Math.floor(this.id / this.model.world.numX)
  }
  isOnEdge () {
    const {x, y, model} = this
    const {minX, maxX, minY, maxY} = model.world
    return x === minX || x === maxX || y === minY || y === maxY
  }

  // Getter for neighbors of this patch.
  // Uses lazy evaluation to promote neighbors to instance variables.
  // To avoid promotion, use `patches.neighbors(this)`.
  // Promotion makes getters accessed only once.
  // defineProperty required: can't set this.neighbors when getter defined.
  get neighbors () { // lazy promote neighbors from getter to instance prop.
    const n = this.patches.neighbors(this)
    Object.defineProperty(this, 'neighbors', {value: n, enumerable: true})
    return n
  }
  get neighbors4 () {
    const n = this.patches.neighbors4(this)
    Object.defineProperty(this, 'neighbors4', {value: n, enumerable: true})
    return n
  }
  // Similar for caching turtles here
  // get turtles () {
  //   Object.defineProperty(this, 'turtles', {value: [], enumerable: true})
  //   return this.turtles
  // }

  // Manage colors by directly setting pixels in Patches pixels object.
  // With getter/setters, slight performance hit but worth it!
  setColor (color) {
    this.patches.pixels.data[this.id] = Color.toColor(color).getPixel()
  }
  // Optimization: If shared color provided, sharedColor is modified and
  // returned. Otherwise new color returned.
  getColor (sharedColor = null) {
    const pixel = this.patches.pixels.data[this.id]
    if (sharedColor) {
      sharedColor.pixel = pixel
      return sharedColor
    }
    return Color.toColor(pixel)
  }
  get color () { return this.getColor() }
  set color (color) { this.setColor(color) }

  // Set label. Erase label via setting to undefined.
  setLabel (label) {
    this.patches.setLabel(this, label)
  }
  getLabel () {
    this.patches.getLabel(this)
  }
  get label () { return this.getLabel() }
  set label (label) { return this.setLabel(label) }

  // Promote this.turtles on first call to turtlesHere.
  turtlesHere () {
    if (this.turtles == null) {
      // this.patches.forEach((patch) => { patch.turtles = [] })
      // this.model.turtles.forEach((turtle) => {
      //   turtle.patch.turtles.push(this)
      // })
      this.patches.ask(p => { p.turtles = [] })
      this.model.turtles.ask(t => { t.patch.turtles.push(t) })

      // for (const patch of this.patches)
      //   patch.turtles = []
      // for (const turtle of this.model.turtles)
      //   turtle.patch.turtles.push(turtle)
    }
    return this.turtles
  }
  // Returns above but returning only turtles of this breed.
  breedsHere (breed) {
    const turtles = this.turtlesHere()
    return turtles.withBreed(breed)
    // return turtles.filter((turtle) => turtle.agentSet === breed)
  }

  // 6 methods in both Patch & Turtle modules
  // Distance from me to x, y. REMIND: No off-world test done
  distanceXY (x, y) { return util.distance(this.x, this.y, x, y) }
  // Return distance from me to object having an x,y pair (turtle, patch, ...)
  distance (agent) { return this.distanceXY(agent.x, agent.y) }
  // Return angle towards agent/x,y
  // Use util.heading to convert to heading
  towards (agent) { return this.towardsXY(agent.x, agent.y) }
  towardsXY (x, y) { return util.radiansToward(this.x, this.y, x, y) }
  // Return patch w/ given parameters. Return undefined if off-world.
  // Return patch dx, dy from my position.
  patchAt (dx, dy) { return this.patches.patch(this.x + dx, this.y + dy) }
  patchAtDirectionAndDistance (direction, distance) {
    return this.patches.patchAtDirectionAndDistance(this, direction, distance)
  }

  // Use the agentset versions so that breeds can considered.
  // Otherwise we'd have to use the patch breed just to be consistant.
  // inRect (patch, dx, dy = dx, meToo = true) {
  //   return this.patches.inRect(this, dx, dy, meToo)
  // }
  // inRadius (radius, meToo = true) { // radius is integer
  //   return this.patches.inRadius(this, radius, meToo)
  // }
  // inCone (radius, coneAngle, direction, meToo = true) {
  //   return this.patches.inRadius(this, radius, coneAngle, direction, meToo)
  // }

  // Breed get/set mathods and getter/setter versions.
  // setBreed (breed) { breed.setBreed(this) }
  // get breed () { return this.agentSet }
  // isBreed (name) { return this.agentSet.name === name }

  sprout (num = 1, breed = this.model.turtles, initFcn = (turtle) => {}) {
    const turtles = this.model.turtles
    return turtles.create(num, (turtle) => {
      turtle.setxy(this.x, this.y)
      if (breed !== turtles) turtle.setBreed(breed)
      initFcn(turtle)
    })
    // return breed.create(num, (turtle) => {
    //   turtle.setxy(this.x, this.y)
    //   initFcn(turtle)
    // })
  }
}

export default Patch
