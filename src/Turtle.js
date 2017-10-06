import Color from './Color.js'
import util from './util.js'

// Flyweight object creation, see Patch/Patches.

// Class Turtle instances represent the dynamic, behavioral element of modeling.
// Each turtle knows the patch it is on, and interacts with that and other
// patches, as well as other turtles.

class Turtle {
  static defaultVariables () {
    return { // Core variables for turtles. Not 'own' variables.
      x: 0,             // x, y, z in patchSize units.
      y: 0,             // Use turtles.setDefault('z', num) to change default height
      z: 0,
      theta: 0,         // my euclidean direction, radians from x axis, counter-clockwise
      size: 1,          // size in patches, default to one patch

      // patch: null,   // the patch I'm on .. uses getter below
      // links: null,   // the links having me as an end point .. lazy promoted below
      atEdge: 'clamp',  // What to do if I wander off world. Can be 'clamp', 'wrap'
                        // 'bounce', or a function, see handleEdge() method
      sprite: null,
      typedColor: null,
      typedStrokeColor: null,
      shapeFcn: `default`

      // spriteFcn: 'default',
      // spriteColor: Color.color(255, 0, 0),

      // labelOffset: [0, 0],  // text pixel offset from the turtle center
      // labelColor: Color.color(0, 0, 0) // the label color
    }
  }
  // Initialize a Turtle given its Turtles AgentSet.
  constructor () {
    Object.assign(this, Turtle.defaultVariables())
  }
  die () {
    this.agentSet.removeAgent(this) // remove me from my baseSet and breed
    if (this.hasOwnProperty('links')) // don't promote links
      while (this.links.length > 0) this.links[0].die()
    if (this.patch.turtles != null)
      util.removeItem(this.patch.turtles, this)
  }
  // // Breed get/set mathods.
  // setBreed (breed) { breed.setBreed(this) }
  // get breed () { return this.agentSet }

  // Factory: create num new turtles at this turtle's location. The optional init
  // proc is called on the new turtle after inserting in its agentSet.
  hatch (num = 1, breed = this.agentSet, init = (turtle) => {}) {
    return this.turtles.create(num, (turtle) => {
      turtle.setxy(this.x, this.y)
      // turtle.color = this.color // REMIND: sprite vs color
      // hatched turtle inherits parents' ownVariables
      for (const key of breed.ownVariables) {
        if (turtle[key] == null) turtle[key] = this[key]
      }
      if (breed !== this.turtles) turtle.setBreed(breed)
      init(turtle)
    })
    // return agentSet.create(num, (turtle) => {
    //   turtle.setxy(this.x, this.y)
    //   // turtle.color = this.color // REMIND: sprite vs color
    //   // hatched turtle inherits parents' ownVariables
    //   for (const key of agentSet.ownVariables) {
    //     if (turtle[key] == null) turtle[key] = this[key]
    //   }
    //   init(turtle)
    // })
  }
  // Getter for links for this turtle. REMIND: use new AgentSet(0)?
  // Uses lazy evaluation to promote links to instance variables.
  // REMIND: Let links create the array as needed, less "tricky"
  get links () { // lazy promote links from getter to instance prop.
    Object.defineProperty(this, 'links', {value: [], enumerable: true})
    return this.links
  }
  // Getter for the patchs and the patch I'm on. Return null if off-world.
  get patch () { return this.model.patches.patch(this.x, this.y) }
  // get patches () { return this.model.patches }

  // Heading vs Euclidean Angles. Direction for clarity when ambiguity.
  get heading () { return util.heading(this.theta) }
  set heading (heading) { this.theta = util.angle(heading) }
  get direction () { return this.theta }
  set direction (theta) { this.theta = theta }

  // setColor (anyColor) { this.color = Color.toColor(anyColor) }
  // getColor () {
  //   if (this.color) return
  //   return this.color || this.sprite
  // }

  // Create my sprite via shape: sprite, fcn, string, or image/canvas
  setSprite (shape = this.shape, color = this.color, strokeColor = this.strokeColor) {
    if (shape.sheet) { this.sprite = shape; return } // src is a sprite
    const ss = this.model.spriteSheet
    color = color || this.turtles.randomColor()
    this.sprite = ss.newSprite(shape, color, strokeColor)
  }
  setSize (size) { this.size = size } // * this.model.world.patchSize }

  setColor (color) {
    // if (this.turtles.settingDefault(this)) console.log(`setting default color ${color}`)
    // if (!this.id) console.log(`setting default color ${color}`)
    const typedColor = Color.toColor(color) // Convert to Color.color
    const fixedColor = this.turtles.renderer.fixedColor // Model set to Color.color
    if (fixedColor && !typedColor.equals(fixedColor)) {
      util.warn(`turtle.setColor: fixedColor != color ${fixedColor.toString()}`)
    // } else if (this.sprite && !settingDefault) {
    } else if (this.sprite) { // default sprite should always be null
      this.sprite.color = typedColor
      this.sprite.needsUpdate = true
    } else { // will set default color or instance color (if not fixed etc)
      this.typedColor = typedColor
    }
  }
  getColor () { return this.sprite ? this.sprite.color : this.typedColor }
  set color (color) { this.setColor(color) }
  get color () { return this.getColor() }

  setStrokeColor (color) {
    const typedColor = Color.toColor(color) // Convert to Color.color
    const fixedColor = this.turtles.renderer.fixedColor // Model set to Color.color
    if (fixedColor) {
      util.warn(`turtle.setStrokeColor: fixedColor ${fixedColor.toString()}`)
    } else if (this.sprite) { // default sprite should always be null
      this.sprite.strokeColor = typedColor
      this.sprite.needsUpdate = true
    } else { // will set default color or instance color
      this.typedStrokeColor = typedColor
    }
  }
  getStrokeColor () {
    return this.sprite ? this.sprite.strokeColor : this.typedStrokeColor
  }
  set strokdColor (color) { this.setStrokeColor(color) }
  get strokdColor () { return this.getStrokeColor() }

  setShape (shape) {
    const fixedShape = this.turtles.renderer.fixedShape
    if (fixedShape && fixedShape !== shape) {
      util.warn(`turtle.setShape: fixedShape ${fixedShape}`)
    } else if (this.sprite) {
      this.sprite.shape = shape
      this.sprite.needsUpdate = true
    } else {
      this.shapeFcn = shape
    }
  }
  getShape () { return this.sprite ? this.sprite.shape : this.shapeFcn }
  set shape (shape) { this.setShape(shape) }
  get shape () { return this.getShape() }

  // setDrawSprite (fcn, color, color2) {
  //   this.sprite = this.model.spriteSheet.addDrawing(fcn, color)
  // }

  // Set x, y position. If z given, override default z.
  // Call handleEdge(x, y) if x, y off-world.
  setxy (x, y, z = null) {
    const p0 = this.patch
    if (z != null) this.z = z // don't promote z if null, use default z instead.
    if (this.model.world.isOnWorld(x, y)) {
      this.x = x
      this.y = y
    } else {
      this.handleEdge(x, y)
      // const {minXcor, maxXcor, minYcor, maxYcor} = this.model.world
      // if (this.wrap) {
      //   this.x = util.wrap(x, minXcor, maxXcor)
      //   this.y = util.wrap(y, minYcor, maxYcor)
      // } else {
      //   this.x = util.clamp(x, minXcor, maxXcor)
      //   this.y = util.clamp(y, minYcor, maxYcor)
      // }
    }
    const p = this.patch
    if (p.turtles != null && p !== p0) {
      util.removeItem(p0.turtles, this)
      p.turtles.push(this)
    }
  }
  // Handle turtle if x,y off-world
  handleEdge (x, y) {
    if (util.isString(this.atEdge)) {
      const {minXcor, maxXcor, minYcor, maxYcor} = this.model.world
      if (this.atEdge === 'wrap') {
        this.x = util.wrap(x, minXcor, maxXcor)
        this.y = util.wrap(y, minYcor, maxYcor)
      } else if (this.atEdge === 'clamp' || this.atEdge === 'bounce') {
        this.x = util.clamp(x, minXcor, maxXcor)
        this.y = util.clamp(y, minYcor, maxYcor)
        if (this.atEdge === 'bounce') {
          if (this.x === minXcor || this.x === maxXcor)
            this.theta = Math.PI - this.theta
          else
            this.theta = -this.theta
        }
      } else {
        throw Error(`turtle.handleEdge: bad atEdge: ${this.atEdge}`)
      }
    } else {
      this.atEdge(this)
    }
  }
  // Place the turtle at the given patch/turtle location
  moveTo (agent) { this.setxy(agent.x, agent.y) }
  // Move forward (along theta) d units (patch coords),
  forward (d) {
    this.setxy(this.x + d * Math.cos(this.theta), this.y + d * Math.sin(this.theta))
  }
  // Change current direction by rad radians which can be + (left) or - (right).
  rotate (rad) { this.theta = util.mod(this.theta + rad, Math.PI * 2) }
  right (rad) { this.rotate(-rad) }
  left (rad) { this.rotate(rad) }

  // Set my direction towards turtle/patch or x,y.
  // "direction" is euclidean radians.
  face (agent) { this.theta = this.towards(agent) }
  faceXY (x, y) { this.theta = this.towardsXY(x, y) }

  // Return the patch ahead of this turtle by distance (patchSize units).
  // Return undefined if off-world.
  patchAhead (distance) {
    return this.patchAtDirectionAndDistance(this.theta, distance)
  }
  // Use patchAhead to determine if this turtle can move forward by distance.
  canMove (distance) { return this.patchAhead(distance) != null } // null / undefined
  patchLeftAndAhead (angle, distance) {
    return this.patchAtDirectionAndDistance(angle + this.theta, distance)
  }
  patchRightAndAhead (angle, distance) {
    return this.patchAtDirectionAndDistance(angle - this.theta, distance)
  }

  // 6 methods in both Patch & Turtle modules
  // Distance from me to x, y. REMIND: No off-world test done
  distanceXY (x, y) { return util.distance(this.x, this.y, x, y) }
  // Return distance from me to object having an x,y pair (turtle, patch, ...)
  // distance (agent) { this.distanceXY(agent.x, agent.y) }
  distance (agent) { return util.distance(this.x, this.y, agent.x, agent.y) }
  // Return angle towards agent/x,y
  // Use util.heading to convert to heading
  towards (agent) { return this.towardsXY(agent.x, agent.y) }
  towardsXY (x, y) { return util.radiansToward(this.x, this.y, x, y) }
  // Return patch w/ given parameters. Return undefined if off-world.
  // Return patch dx, dy from my position.
  patchAt (dx, dy) { return this.model.patches.patch(this.x + dx, this.y + dy) }
  // Note: angle is absolute, w/o regard to existing angle of turtle.
  // Use Left/Right versions below
  patchAtDirectionAndDistance (direction, distance) {
    return this.model.patches.patchAtDirectionAndDistance(this, direction, distance)
  }

  // // Return turtles/breeds within radius from me
  // inRadius (radius, meToo = false) {
  //   return this.agentSet.inRadius(this, radius, meToo)
  // }
  // // Return turtles/breeds within cone from me
  // // Note: agentSet rather than turtles to allow for breeds
  // inCone (radius, coneAngle, meToo = false) {
  //   return this.agentSet.inCone(this, radius, coneAngle, this.theta, meToo)
  // }

  // Link methods. Note: this.links returns all links linked to me.
  // See links getter above.

  // Return other end of link from me. Link must include me!
  otherEnd (l) { return l.end0 === this ? l.end1 : l.end0 }
  // Return all turtles linked to me
  linkNeighbors () { return this.links.map((l) => this.otherEnd(l)) }
}

export default Turtle
