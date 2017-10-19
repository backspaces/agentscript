// class World defines the coordinate system for the model.
// It will be upgraded with methods converting from other
// transforms like GIS and DataSets.

class World {
  static defaultOptions (maxX = 16, maxY = maxX) {
    return {
      minX: -maxX,
      maxX: maxX,
      minY: -maxY,
      maxY: maxY
    }
  }
  // Initialize the world w/ defaults overridden w/ options.
  constructor (options = {}) {
    Object.assign(this, World.defaultOptions()) // initial this w/ defaults
    Object.assign(this, options) // override defaults with options
    this.setWorld()
  }
  // Complete properties derived from minX/Y, maxX/Y (patchSize === 1)
  setWorld () {
    this.numX = this.maxX - this.minX + 1
    this.numY = this.maxY - this.minY + 1
    this.width = this.numX // REMIND: remove?
    this.height = this.numY
    this.minXcor = this.minX - 0.5
    this.maxXcor = this.maxX + 0.5
    this.minYcor = this.minY - 0.5
    this.maxYcor = this.maxY + 0.5
    this.centerX = (this.minX + this.maxX) / 2
    this.centerY = (this.minY + this.maxY) / 2
  }
  // Test x,y for being on-world.
  isOnWorld (x, y) {
    return (this.minXcor <= x) && (x <= this.maxXcor) &&
           (this.minYcor <= y) && (y <= this.maxYcor)
  }
  // Convert a canvas to world coordinates.
  // The size is determined by patchSize.
  setCtxTransform (ctx, patchSize) {
    ctx.canvas.width = this.width * patchSize
    ctx.canvas.height = this.height * patchSize
    ctx.save()
    ctx.scale(patchSize, -patchSize)
    ctx.translate(-(this.minXcor * patchSize), -(this.maxYcor * patchSize))
  }
}

export default World
