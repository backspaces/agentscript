import util from './util.js'

// A **DataSet** is an object with width/height and an array
// whose length = width * height
//
// The data array can be a TypedArray or a javascript Array
// Notice that it is very much like an ImageData object!

class DataSet {
  // **Static methods:** called via DataSet.foo(), similar to Math.foo().
  // Generally useful utilities for use with TypedArrays & JS Arrays

  // Return an empty dataset of given width, height, dataType
  static emptyDataSet (width, height, Type) {
    return new DataSet(width, height, new Type(width * height))
  }

  // The **DataSet Class** constructor and methods

  // constructor: Stores the three DataSet components.
  // Checks data is right size, throws an error if not.
  constructor (width, height, data) {
    if (data.length !== width * height)
      throw Error(`new DataSet length: ${data.length} !== ${width} * ${height}`)
    Object.assign(this, {width, height, data})
  }

  // Get/Set name, useful for storage key.
  setName (string) { this.name = string; return this }
  getName () { return this.name ? this.name : this.makeName() }
  makeName () {
    const {width, height} = this
    const sum = util.arraySum(this.data).toFixed(2)
    return `${this.dataType().name}-${width}-${height}-${sum}`
  }

  // Checks x,y are within DataSet. Throw error if not.
  checkXY (x, y) {
    if (!this.inBounds(x, y))
      throw Error(`DataSet: x,y out of range: ${x}, ${y}`)
  }
  // true if x,y in dataset bounds
  inBounds (x, y) {
    return (util.between(x, 0, this.width - 1) && util.between(y, 0, this.height - 1))
  }

  dataType () { return this.data.constructor }
  type () { return this.constructor }

  // Given x,y in data space, return index into data
  toIndex (x, y) { return x + (y * this.width) }

  // Given index into data, return dataset [x, y] position
  toXY (i) { return [i % this.width, Math.floor(i / this.width)] }

  // Get dataset value at x,y, assuming that x,y valididated previously
  // getXY (x, y) { return this.data[this.toIndex(Math.floor(x), Math.floor(y))] }
  getXY (x, y) { return this.data[this.toIndex(x, y)] }

  // Set the data value at x,y to num. assume x,y valid
  // setxy (x, y, num) { this.data[this.toIndex(Math.floor(x), Math.floor(y))] = num }
  setxy (x, y, num) { this.data[this.toIndex(x, y)] = num }

  // Wrapper for sampling, defaults to "nearest". Checks x,y valid as well.
  // Use this for individual sampling.
  sample (x, y, useNearest = true) {
    this.checkXY(x, y)
    return useNearest ? this.nearest(x, y) : this.bilinear(x, y)
  }

  // Nearest neighbor sampling, w/o x,y validity check, i.e. our inner loops
  nearest (x, y) {
    return this.getXY(Math.round(x), Math.round(y))
  }

  // Billinear sampling w/o x,y validity check, i.e. our inner loops
  bilinear (x, y) {
    // Billinear sampling works by making two linear interpolations (lerps)
    // in the x direction, and a third in the y direction, between the
    // two x results. See wikipedia:
    // [bilinear sampling](http://en.wikipedia.org/wiki/Bilinear_interpolation)
    // The diagram shows the three lerps

    // const [x0, y0] = [Math.floor(x), Math.floor(y)] // replaced by next line for speed
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const i = this.toIndex(x0, y0)
    const w = this.width
    // const [dx, dy] = [(x - x0), (y - y0)] // dx, dy = 0 if x, y on boundary. commented out for speed
    // const [dx1, dy1] = [1 - dx, 1 - dy] // dx1, dy1 = 1 if x, y on boundary
    const dx = x - x0
    const dy = y - y0
    const dx1 = 1 - dx
    const dy1 = 1 - dy
    const f00 = this.data[i]
    // Edge case: fij is 0 if beyond data array; undefined -> 0.
    // This cancels the given component's factor in the result.
    const f10 = this.data[i + 1] || 0 // 0 at bottom right corner
    const f01 = this.data[i + w] || 0 // 0 at all bottom row
    const f11 = this.data[i + 1 + w] || 0 // 0 at end of next to bottom row
    // This is a bit involved but:
    // ```
    // If dx = 0; dx1 = 1, dy != 0
    // -> vertical linear interpolation
    // fxy = f00(1-dy) + f01(dy) i.e. y-lerp
    //
    // If dx != 0; dy = 0, dx !=0
    // -> horizontal linear interpolation
    // fxy = f00(1-dx) + f10(dx) i.e. x-lerp
    // ```
    return (f00 * dx1 * dy1) + (f10 * dx * dy1) +
           (f01 * dx1 * dy) + (f11 * dx * dy)
  }

  // Return a copy of this, with new data array
  copy () {
    return new DataSet(this.width, this.height, util.copyArray(this.data))
  }

  // Return new (empty) dataset, defaulting to this type
  emptyDataSet (width, height, type = this.dataType()) {
    return DataSet.emptyDataSet(width, height, type) // see static above
  }

  // Return new (empty) array of this type
  emptyArray (length) {
    const Type = this.type()
    return new Type(length)
  }

  // Create new dataset of size width/height/type by resampling each point.
  // Type is not this.type() due to integer/float differences. Default Array.
  // If same size, return a copy of this.
  resample (width, height, useNearest = true, Type = Array) {
    if (width === this.width && height === this.height) return this.copy()
    const ds = DataSet.emptyDataSet(width, height, Type)
    const xScale = (this.width - 1) / (width - 1)
    const yScale = (this.height - 1) / (height - 1)
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++)
        ds.setxy(x, y, this.sample(x * xScale, y * yScale, useNearest))
    return ds
  }

  // Return a rectangular subset of the dataset.
  // Returned dataset is of same array type as this.
  subset (x, y, width, height) {
    if ((x + width) > this.width || (y + height) > this.height)
      throw Error('DataSet.subSet: params out of range')
    const ds = this.emptyDataSet(width, height)
    for (let i = 0; i < width; i++)
      for (let j = 0; j < height; j++)
        ds.setxy(i, j, this.getXY(i + x, j + y))
    return ds
  }

  // Return maped dataset by applying f to each dataset element
  map (f) {
    return new DataSet(this.width, this.height, this.data.map(f))
  }

  // Return the column of data at position x as this array's type
  col (x) {
    const [w, h, data] = [this.width, this.height, this.data]
    if (x >= w)
      throw Error(`col: x out of range width: ${w} x: ${x}`)
    const colData = this.emptyArray(h)
    for (let i = 0; i < h; i++)
      colData[i] = data[x + i * w]
    return colData
  }

  // Return the row of data at position y as this array's type
  row (y) {
    const [w, h] = [this.width, this.height]
    if (y >= h)
      throw Error(`row: y out of range height: ${h} x: ${y}`)
    return this.data.slice(y * w, (y + 1) * w)
  }

  // Convert this dataset's data to new type. Precision may be lost.
  // Does nothing if current data is already of this Type.
  convertType (type) {
    this.data = util.convertArray(this.data, type)
  }

  // Concatinate a dataset of equal height to my right to my east.
  // New DataSet is of same type as this.
  //
  // NOTE: concatWest is dataset.concatEast(this)
  concatEast (ds) {
    const [w, h] = [this.width, this.height]
    const [w1, h1] = [ds.width, ds.height]
    if (h !== h1)
      throw Error(`concatEast: heights not equal ${h}, ${h1}`)
    const ds1 = this.emptyDataSet((w + w1), h)
    for (let x = 0; x < h; x++) // copy this into new dataset
      for (let y = 0; y < w; y++)
        ds1.setxy(x, y, this.getXY(x, y))
    for (let x = 0; x < h1; x++) // copy ds to the left side
      for (let y = 0; y < w1; y++)
        ds1.setxy(x + w, y, ds.getXY(x, y))
    return ds1
  }

  // Concatinate a dataset of equal width to my south, returning new DataSet.
  // New DataSet is of same type as this.
  //
  // NOTE: concatNorth is dataset.concatSouth(this)
  concatSouth (dataset) {
    const [w, h, data] = [this.width, this.height, this.data]
    if (w !== dataset.width)
      throw Error(`concatSouth: widths not equal ${w}, ${dataset.width}`)
    const data1 = util.concatArrays(data, dataset.data)
    return new DataSet(w, h + dataset.height, data1)
  }

  // return dataset x,y given x,y in a euclidean space defined by tlx, tly, w, h
  // x,y is in topleft-bottomright box: [tlx,tly,tlx+w,tly-h], y positive util.
  // Ex: NetLogo's coords: x, y, minXcor, maxYcor, numX, numY
  transformCoords (x, y, tlx, tly, w, h) {
    const xs = (x - tlx) * (this.width - 1) / w
    const ys = (tly - y) * (this.height - 1) / h
    return [xs, ys]
  }

  // get a sample using a transformed euclidean coord system; see above
  coordSample (x, y, tlx, tly, w, h, useNearest = true) {
    const [xs, ys] = this.transformCoords(x, y, tlx, tly, w, h)
    return this.sample(xs, ys, useNearest)
  }

  // Return Array 3x3 neighbor values of the given x,y of the dataset.
  // Off-edge neighbors revert to nearest edge value.
  neighborhood (x, y, array = []) {
    array.length = 0  // in case user supplied an array to reduce GC
    const clampNeeded = (x === 0) || (x === this.width - 1) ||
                        (y === 0) || (y === this.height - 1)
    for (let dy = -1; dy <= +1; dy++) {
      for (let dx = -1; dx <= +1; dx++) {
        let x0 = x + dx
        let y0 = y + dy
        if (clampNeeded) {
          x0 = util.clamp(x0, 0, this.width - 1)
          y0 = util.clamp(y0, 0, this.height - 1)
        }
        array.push(this.data[this.toIndex(x0, y0)])
      }
    }
    return array
  }

  // Return a new dataset of this array type convolved with the
  // given kernel 3x3 matrix. See [Convolution article](https://goo.gl/gCfXmU)
  //
  // If cropped, do not convolve the edges, returning a smaller dataset.
  // If not, convolve the edges by extending edge values, returning
  // dataset of same size.
  convolve (kernel, factor = 1, crop = false) {
    const [x0, y0, h, w] = crop // optimization not needed, only called once
     ? [1, 1, this.height - 1, this.width - 1]
     : [0, 0, this.height, this.width]
    const newDS = this.emptyDataSet(w, h)
    const newData = newDS.data
    let i = 0
    for (let y = y0; y < h; y++) {
      for (let x = x0; x < w; x++) {
        const nei = this.neighborhood(x, y)
        let sum2 = 0
        for (let i2 = 0; i2 < kernel.length; i2++) {
          // sum2 += kernel[i2] * nei[i2] // Chrome can't optimize compound let
          sum2 = sum2 + kernel[i2] * nei[i2]
        }
        newData[i++] = sum2 * factor // newDS.data[newDS.toIndex(x, y)] = sum2 * factor
      }
    }
    return newDS
  }

  // A few common convolutions.  dzdx/y are also called horiz/vert Sobel
  dzdx (n = 2, factor = 1 / 8) {
    return this.convolve([-1, 0, 1, -n, 0, n, -1, 0, 1], factor)
  }
  dzdy (n = 2, factor = 1 / 8) {
    return this.convolve([1, n, 1, 0, 0, 0, -1, -n, -1], factor)
  }
  laplace8 () {
    return this.convolve([-1, -1, -1, -1, 8, -1, -1, -1, -1])
  }
  laplace4 () {
    return this.convolve([0, -1, 0, -1, 4, -1, 0, -1, 0])
  }
  blur (factor = 0.0625) { // 1/16 = 0.0625
    return this.convolve([1, 2, 1, 2, 4, 2, 1, 2, 1], factor)
  }
  edge () {
    return this.convolve([1, 1, 1, 1, -7, 1, 1, 1, 1])
  }

  // Create two new Array convolved datasets, slope and aspect, common in
  // the use of an elevation data set. See Esri tutorials for
  // [slope](http://goo.gl/ZcOl08) and [aspect](http://goo.gl/KoI4y5)
  //
  // It also returns the two derivitive DataSets, dzdx, dzdy for
  // those wanting to use the results of the two convolutions.
  //
  // Use this.convertType to convert to typed array
  slopeAndAspect (cellSize = 1, noNaNs = true, posAngle = true) {
    const dzdx = this.dzdx() // sub left z from right
    const dzdy = this.dzdy() // sub bottom z from top
    let [aspect, slope] = [[], []]
    const [h, w] = [dzdx.height, dzdx.width]
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let [gx, gy] = [dzdx.getXY(x, y), dzdy.getXY(x, y)]
        slope.push(Math.atan(util.distance(gx, gy)) / cellSize) // radians
        if (noNaNs)
          while (gx === gy) {
            gx += util.randomNormal(0, 0.0001)
            gy += util.randomNormal(0, 0.0001)
          }
        // radians in [-PI,PI], downhill
        let rad = (gx === gy && gy === 0) ? NaN : Math.atan2(-gy, -gx)
        // positive radians in [0,2PI] if desired
        if (posAngle && rad < 0) rad += 2 * Math.PI
        aspect.push(rad)
      }
    }
    slope = new DataSet(w, h, slope)
    aspect = new DataSet(w, h, aspect)
    return { slope, aspect, dzdx, dzdy }
  }

  // REMIND: limit to data that can be 24 bit. Error otherwise.
  // DataType of Int8, 16, Int24 OK, others need testing.
  // Possibly use precision to minimize byte size to 3, rgb?
  //
  // Convert dataset to an image context object.
  //
  // This can be used to "visualize" the data by normalizing
  // which will scale the data to use the entire RGB space.
  // It can also be used to create tiles or image-as-data if
  // the defaults are used.
  //
  // Due to
  // [alpha-premultiply](https://en.wikipedia.org/wiki/Alpha_compositing),
  // the best we can do as data is 24 bit ints.
  // You can simulate floats/fixed by multiplying the dataset
  // the dividing on conversion back.
  //
  // Our preferred transport is in the works, likely in the
  // tile datasets via blobs or arraybuffers. Sigh.
  toContext (normalize = false, gray = false, alpha = 255) {
    const [w, h, data] = [this.width, this.height, this.data]
    let idata
    if (normalize) {
      idata = gray
        ? util.normalize8(data) : util.normalizeInt(data, 0, Math.pow(2, 24) - 1)
    } else {
      idata = data.map((a) => Math.round(a))
    }
    const ctx = util.createCtx(w, h)
    const id = ctx.getImageData(0, 0, w, h)
    const ta = id.data // ta short for typed array
    for (let i = 0; i < idata.length; i++) {
      const [num, j] = [idata[i], 4 * i] // j = byte index into ta
      if (gray) {
        ta[j] = ta[j + 1] = ta[j + 2] = Math.floor(num); ta[j + 3] = alpha
      } else {
        ta[j] = (num >> 16) & 0xff
        ta[j + 1] = (num >> 8) & 0xff
        ta[j + 2] = num & 0xff
        ta[j + 3] = alpha // if not 255, image will be premultiplied.
      }
    }
    ctx.putImageData(id, 0, 0)
    return ctx
  }

  // Convert dataset to a canvas, which can be used as an image
  toCanvas (normalize = false, gray = false, alpha = 255) {
    return this.toContext(gray, normalize, alpha).canvas
  }
  // Convert dataset to a base64 string
  toDataUrl (normalize = false, gray = false, alpha = 255) {
    return util.ctxToDataUrl(this.toContext(gray, normalize, alpha))
  }

  // Return max/min of data
  max () {
    return this.data.reduce(function (a, b) {
      return Math.max(a, b)
    })
  }
  min () {
    return this.data.reduce(function (a, b) {
      return Math.min(a, b)
    })
  }
  // Test that this has same width, height, data as dataset.
  // Note: does not require equal array type (Array or TypedArray)
  equals (dataset) {
    return this.width === dataset.width &&
      this.height === dataset.height &&
      util.arraysEqual(this.data, dataset.data)
  }
}

export default DataSet
