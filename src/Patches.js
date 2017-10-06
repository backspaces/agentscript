import util from './util.js'
import AgentArray from './AgentArray.js'
import AgentSet from './AgentSet.js'
import DataSet from './DataSet.js'

// Patches are the world other agentsets live on. They create a coord system
// from Model's world values: size, minX, maxX, minY, maxY
class Patches extends AgentSet {
  constructor (model, AgentClass, name) {
    // AgentSet sets these variables:
    // model, name, baseSet, world: model.world, agentProto: new AgentClass
    // REMIND: agentProto: defaults, agentSet, world, [name]=agentSet.baseSet
    super(model, AgentClass, name)

    // Skip if a breedSet (don't rebuild patches!).
    if (this.isBreedSet()) return

    this.populate()
    this.setPixels()
    this.labels = [] // sparse array for labels
  }
  // Set up all the patches.
  populate () {
    util.repeat(this.model.world.numX * this.model.world.numY, (i) => {
      this.addAgent() // Object.create(this.agentProto))
    })
  }
  // Setup pixels ctx used for patch.color: `draw` and `importColors`
  setPixels () {
    const {numX, numY} = this.model.world
    // const ctx = this.model.contexts.patches
    // const pixels = this.pixels = {are1x1: patchSize === 1}
    // pixels.ctx = pixels.are1x1 ? ctx : util.createCtx(numX, numY)
    this.pixels = {
      ctx: util.createCtx(numX, numY)
    }
    this.setImageData()
  }
  // Create the pixels object used by `setPixels` and `installColors`
  setImageData () {
    const pixels = this.pixels
    pixels.imageData = util.ctxImageData(pixels.ctx)
    pixels.data8 = pixels.imageData.data
    pixels.data = new Uint32Array(pixels.data8.buffer)
  }

  setDefault (name, value) {
    if (name === 'color') {
      this.ask(p => { p.setColor(value) })
      util.logOnce(`patches.setDefault(color, value): color default not supported. Clearing to value`)
    } else {
      super.setDefault(name, value)
    }
  }
  // Get/Set label. REMIND: not implemented.
  // Set removes label if label is null or undefined.
  // Get returns undefined if no label.
  setLabel (patch, label) { // REMIND: does this work for breeds?
    if (label == null) // null or undefined
      delete this.labels[patch.id]
    else
      this.labels[patch.id] = label
  }
  getLabel (patch) {
    return this.labels[patch.id]
  }

  // Return the offsets from a patch for its 8 element neighbors.
  // Specialized to be faster than inRect below.
  neighborsOffsets (x, y) {
    const {minX, maxX, minY, maxY, numX} = this.model.world
    if (x === minX) {
      if (y === minY) return [-numX, -numX + 1, 1]
      if (y === maxY) return [1, numX + 1, numX]
      return [-numX, -numX + 1, 1, numX + 1, numX]
    }
    if (x === maxX) {
      if (y === minY) return [-numX - 1, -numX, -1]
      if (y === maxY) return [numX, numX - 1, -1]
      return [-numX - 1, -numX, numX, numX - 1, -1]
    }
    if (y === minY) return [-numX - 1, -numX, -numX + 1, 1, -1]
    if (y === maxY) return [1, numX + 1, numX, numX - 1, -1]
    return [-numX - 1, -numX, -numX + 1, 1, numX + 1, numX, numX - 1, -1]
  }
  // Return the offsets from a patch for its 4 element neighbors (N,S,E,W)
  neighbors4Offsets (x, y) {
    const numX = this.model.world.numX
    return this.neighborsOffsets(x, y)
      .filter((n) => Math.abs(n) === 1 || Math.abs(n) === numX) // slightly faster
      // .filter((n) => [1, -1, numX, -numX].indexOf(n) >= 0)
      // .filter((n) => [1, -1, numX, -numX].includes(n)) // slower than indexOf
  }
  // Return my 8 patch neighbors
  neighbors (patch) {
    const {id, x, y} = patch
    const offsets = this.neighborsOffsets(x, y)
    const as = new AgentArray(offsets.length)
    offsets.forEach((o, i) => { as[i] = this[o + id] })
    return as
    // offsets.forEach((o, i, a) => { a[i] = this[o + id] })
    // return this.asAgentSet(offsets)
  }
  // Return my 4 patch neighbors
  neighbors4 (patch) {
    const {id, x, y} = patch
    const offsets = this.neighbors4Offsets(x, y)
    const as = new AgentArray(offsets.length)
    offsets.forEach((o, i) => { as[i] = this[o + id] })
    return as
  }

  // Return a random valid int x,y point in patch space
  randomPt () {
    // const {minXcor, maxXcor, minYcor, maxYcor} = this.model.world
    // return [util.randomFloat2(minXcor, maxXcor), util.randomFloat2(minYcor, maxYcor)]
    const {minX, maxX, minY, maxY} = this.model.world
    return [util.randomInt2(minX, maxX), util.randomInt2(minY, maxY)]
  }

  installPixels () {
    const pixels = this.pixels
    pixels.ctx.putImageData(pixels.imageData, 0, 0)
    return pixels
  }
  // REMIND: Three .. need pixels -> texture
  // Draw the patches onto the ctx using the pixel image data colors.
  // draw (ctx = this.model.contexts.patches) {
  //   const {pixels} = this
  //   pixels.ctx.putImageData(pixels.imageData, 0, 0)
  //   if (!pixels.are1x1)
  //     util.fillCtxWithImage(ctx, pixels.ctx.canvas)
  //   for (const i in this.labels) { // `for .. in`: skips sparse array gaps.
  //     const label = this.labels[i]
  //     const {labelOffset: offset, labelColor: color} = this[i]
  //     const [x, y] = this.patchXYToPixelXY(...this.patchIndexToXY(i))
  //     util.ctxDrawText(ctx, label, x + offset[0], y + offset[1], color.getCss())
  //   }
  // }
  // REMIND: No drawing layer yet
  // // Draws, or "imports" an image URL into the drawing layer.
  // // The image is scaled to fit the drawing layer.
  // // This is an async function, using es6 Promises.
  // importDrawing (imageSrc) {
  //   util.imagePromise(imageSrc)
  //   .then((img) => this.installDrawing(img))
  // }
  // // Direct install image into the given context, not async.
  // installDrawing (img, ctx = this.model.contexts.drawing) {
  //   util.fillCtxWithImage(ctx, img)
  // }
  importColors (imageSrc) {
    util.imagePromise(imageSrc)
    .then((img) => this.installColors(img))
  }
  // Direct install image into the patch colors, not async.
  installColors (img) {
    util.fillCtxWithImage(this.pixels.ctx, img)
    this.setImageData()
  }

  // Import/export DataSet to/from patch variable `patchVar`.
  // `useNearest`: true for fast rounding to nearest; false for bi-linear.
  importDataSet (dataSet, patchVar, useNearest = false) {
    if (this.isBreedSet()) { // REMIND: error
      util.warn('Patches: exportDataSet called with breed, using patches')
      this.baseSet.importDataSet(dataSet, patchVar, useNearest)
    }
    const {numX, numY} = this.model.world
    const dataset = dataSet.resample(numX, numY, useNearest)
    this.ask(p => { p[patchVar] = dataset.data[p.id] })
    // for (const patch of this)
    //   patch[patchVar] = dataset.data[patch.id]
  }
  exportDataSet (patchVar, Type = Array) {
    if (this.isBreedSet()) {
      util.warn('Patches: exportDataSet called with breed, using patches')
      this.baseSet.exportDataSet(patchVar, Type)
    }
    const {numX, numY} = this.model.world
    // let data = util.arrayProps(this, patchVar)
    let data = this.props(this, patchVar)
    data = util.convertArray(data, Type)
    return new DataSet(numX, numY, data)
  }

  // Return true if x,y floats are within patch world.
  // isOnWorld (x, y) {
  //   const {minXcor, maxXcor, minYcor, maxYcor} = this.model.world
  //   return (minXcor <= x) && (x <= maxXcor) && (minYcor <= y) && (y <= maxYcor)
  // }
  // Return the patch id/index given valid integer x,y in patch coords
  patchIndex (x, y) {
    const {minX, maxY, numX} = this.model.world
    return (x - minX) + (numX * (maxY - y))
  }
  // patchXYToIndex (x, y) {
  //   const {minX, maxY, numX} = this.model.world
  //   return (x - minX) + (numX * (maxY - y))
  // }
  // // Return the patch x,y patch coords given a valid patches id/index
  // patchIndexToXY (ix) {
  //   const {minX, maxY, numX} = this.model.world
  //   return [(ix % numX) + minX, maxY - Math.floor(ix / numX)]
  // }
  // // Convert to/from pixel coords & patch coords
  // pixelXYToPatchXY (x, y) {
  //   const {patchSize, minXcor, maxYcor} = this.model.world
  //   return [minXcor + (x / patchSize), maxYcor - (y / patchSize)]
  // }
  // patchXYToPixelXY (x, y) {
  //   const {patchSize, minXcor, maxYcor} = this.model.world
  //   return [(x - minXcor) * patchSize, (maxYcor - y) * patchSize]
  // }

  // Utils for NetLogo patch location methods.
  // All return `undefined` if not onworld.
  // Note that foo == null checks for both undefined and null (== vs ===)
  // and is considered an OK practice.

  // Return patch at x,y float values according to topology.
  // Return undefined if off-world
  patch (x, y) {
    if (!this.model.world.isOnWorld(x, y)) return undefined
    const intX = x === this.model.world.maxXcor
      ? this.model.world.maxX : Math.round(x) // handle n.5 round up to n + 1
    const intY = y === this.model.world.maxYcor
      ? this.model.world.maxY : Math.round(y)
    return this.patchXY(intX, intY)
  }
  // Return the patch at x,y where both are valid integer patch coordinates.
  patchXY (x, y) { return this[this.patchIndex(x, y)] }

  // Patches in rectangle dx, dy from p, dx, dy integers.
  // Both dx & dy are half width/height of rect
  patchRect (p, dx, dy = dx, meToo = true) {
    // Return cached rect if one exists.
    // if (p.pRect && p.pRect.length === dx * dy) return p.pRect
    if (p.rectCache) {
      const index = this.cacheIndex(dx, dy, meToo)
      const rect = p.rectCache[index]
      // const rect = p.rectCache[this.cacheIndex(dx, dy, meToo)]
      if (rect) return rect
    }
    const rect = new AgentArray()
    let {minX, maxX, minY, maxY} = this.model.world
    minX = Math.max(minX, p.x - dx)
    maxX = Math.min(maxX, p.x + dx)
    minY = Math.max(minY, p.y - dy)
    maxY = Math.min(maxY, p.y + dy)
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const pnext = this.patchXY(x, y)
        if (p !== pnext || meToo) rect.push(pnext)
      }
    }
    return rect
  }

  // Performance: create a cached rect of this size in sparse array.
  // Index of cached rect is dx * dy + meToo ? 0 : -1.
  // This works for edge rects that are not that full size.
  // patchRect will use this if matches dx, dy, meToo.
  cacheIndex (dx, dy = dx, meToo = true) {
    return (2 * dx + 1) * (2 * dy + 1) + (meToo ? 0 : -1)
  }
  cacheRect (dx, dy = dx, meToo = true, clear = true) {
    const index = this.cacheIndex(dx, dy, meToo)
    this.ask(p => {
      if (!p.rectCache || clear) p.rectCache = []
      const rect = this.inRect(p, dx, dy, meToo)
      p.rectCache[index] = rect
    })
  }

// Return patches within the patch rect, default is square & meToo
  // inRect (patch, dx, dy = dx, meToo = true) {
  //   return this.inRect(patch, dx, dy, meToo)
  // }
  // Patches in circle radius (integer) from patch
  // inRadius (patch, radius, meToo = true) {
  //   const rSq = radius * radius
  //   const result = new AgentArray()
  //   const sqDistance = util.sqDistance // 10% faster
  //   const pRect = this.inRect(patch, radius, radius, meToo)
  //   for (let i = 0; i < pRect.length; i++) {
  //     const p = pRect[i]
  //     if (sqDistance(patch.x, patch.y, p.x, p.y) <= rSq) result.push(p)
  //   }
  //   return result
  // }
  inRect (patch, dx, dy = dx, meToo = true) {
    const pRect = this.patchRect(patch, dx, dy, meToo)
    if (this.isBaseSet()) return pRect
    return pRect.withBreed(this)
  }
  inRadius (patch, radius, meToo = true) {
    const pRect = this.inRect(patch, radius, radius, meToo)
    return pRect.inRadius(patch, radius, meToo)
  }
  // Patches in cone from p in direction `angle`, with `coneAngle` and `radius`
  inCone (patch, radius, coneAngle, direction, meToo = true) {
    const pRect = this.inRect(patch, radius, radius, meToo)
    return pRect.inCone(patch, radius, coneAngle, direction, meToo)

    // const result = new AgentArray()
    // for (let i = 0; i < pRect.length; i++) {
    //   const p = pRect[i]
    //   const isIn = util.inCone(p.x, p.y, radius, coneAngle, direction, patch.x, patch.y)
    //   if (isIn && (patch !== p || meToo)) result.push(p)
    // }
    // return result
  }

  // Return patch at distance and angle from obj's (patch or turtle)
  // x, y (floats). If off world, return undefined.
  // To use heading: patchAtDirectionAndDistance(obj, util.angle(heading), distance)
  // Does not take into account the angle of the obj .. turtle.theta for example.
  patchAtDirectionAndDistance (obj, angle, distance) {
    let {x, y} = obj
    x = x + distance * Math.cos(angle)
    y = y + distance * Math.sin(angle)
    return this.patch(x, y)
  }
  // patchLeftAndAhead (dTheta, distance) {
  //   return this.patchAtDirectionAndDistance(dTheta, distance)
  // }
  // patchRightAndAhead (dTheta, distance) {
  //   return this.patchAtDirectionAndDistance(-dTheta, distance)
  // }

  // Diffuse the value of patch variable `p.v` by distributing `rate` percent
  // of each patch's value of `v` to its neighbors.
  // If a color map is given, scale the patch color via variable's value
  // If the patch has less than 4/8 neighbors, return the extra to the patch.
  diffuse (v, rate, colorMap = null, min = 0, max = 1) {
    this.diffuseN(8, v, rate, colorMap, min, max)
  }
  diffuse4 (v, rate, colorMap = null, min = 0, max = 1) {
    this.diffuseN(4, v, rate, colorMap, min, max)
  }
  diffuseN (n, v, rate, colorMap = null, min = 0, max = 1) {
    // Note: for-of loops removed: chrome can't optimize them
    // test/apps/patches.js 22fps -> 60fps
    // zero temp variable if not yet set
    if (this[0]._diffuseNext === undefined)
      // for (const p of this) p._diffuseNext = 0
      for (let i = 0; i < this.length; i++) this[i]._diffuseNext = 0

    // pass 1: calculate contribution of all patches to themselves and neighbors
    // for (const p of this) {
    for (let i = 0; i < this.length; i++) {
      const p = this[i]
      const dv = p[v] * rate
      const dvn = dv / n
      const neighbors = (n === 8) ? p.neighbors : p.neighbors4
      const nn = neighbors.length
      p._diffuseNext += p[v] - dv + (n - nn) * dvn
      // for (const n of neighbors) n._diffuseNext += dvn
      for (let i = 0; i < neighbors.length; i++) neighbors[i]._diffuseNext += dvn
    }
    // pass 2: set new value for all patches, zero temp,
    // modify color if colorMap given
    // for (const p of this) {
    for (let i = 0; i < this.length; i++) {
      const p = this[i]
      p[v] = p._diffuseNext
      p._diffuseNext = 0
      if (colorMap)
        p.setColor(colorMap.scaleColor(p[v], min, max))
    }
  }
}

export default Patches
