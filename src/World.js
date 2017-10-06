// class World defines the coordinate system for the model.
// It will be upgraded with methods converting from other
// transforms like GIS and DataSets.

class World {
  static defaultOptions (size = 13, max = 16) {
    return {
      patchSize: size,
      minX: -max,
      maxX: max,
      minY: -max,
      maxY: max
    }
  }
  // Initialize the world w/ defaults overridden w/ options.
  constructor (options = {}) {
    Object.assign(this, World.defaultOptions()) // initial this w/ defaults
    Object.assign(this, options) // override defaults with options
    this.setWorld()
  }
  // Complete properties derived from patchSize, minX/Y, maxX/Y
  setWorld () {
    this.numX = this.maxX - this.minX + 1
    this.numY = this.maxY - this.minY + 1
    this.width = this.numX * this.patchSize
    this.height = this.numY * this.patchSize
    this.minXcor = this.minX - 0.5
    this.maxXcor = this.maxX + 0.5
    this.minYcor = this.minY - 0.5
    this.maxYcor = this.maxY + 0.5
    this.centerX = (this.minX + this.maxX) / 2
    this.centerY = (this.minY + this.maxY) / 2
  }
  isOnWorld (x, y) {
    return (this.minXcor <= x) && (x <= this.maxXcor) &&
           (this.minYcor <= y) && (y <= this.maxYcor)
  }
  setCtxTransform (ctx) {
    ctx.canvas.width = this.width
    ctx.canvas.height = this.height
    ctx.save()
    ctx.scale(this.patchSize, -this.patchSize)
    ctx.translate(-(this.minXcor), -(this.maxYcor))
  }
}

export default World
