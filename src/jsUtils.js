// /** @namespace */
/** @module */

// note Deno has "window" alas!
export function inMain() {
    return globalThis.document !== undefined
}
export function inWorker() {
    // This should work for browser and deno
    return globalThis.WorkerGlobalScope !== undefined
}
export function inNode() {
    return typeof globalThis.require !== 'undefined'
}
export function inDeno() {
    return typeof globalThis.Deno !== 'undefined'
}

// ### Async & I/O

// /**
//  * Return a Promise for getting an image.
//  *
//  * use: imagePromise('./path/to/img').then(img => imageFcn(img))
//  * or: await imagePromise('./path/to/img')
//  *
//  * @param {string} url URL for path to image
//  * @returns {Promise} A promise resolving to the image
//  */
// export function imagePromise(url) {
//     return new Promise((resolve, reject) => {
//         const img = new Image()
//         img.crossOrigin = 'Anonymous'
//         img.onload = () => resolve(img)
//         // img.onerror = () => reject(Error(`Could not load image ${url}`))
//         img.onerror = () => reject(`Could not load image ${url}`)
//         img.src = url
//     })
// }

// Like Function but is async
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
export function AsyncFunction(argsArray, fcnBody) {
    const ctor = Object.getPrototypeOf(async function () {}).constructor
    const asyncFcn = new ctor(...argsArray, fcnBody)
    return asyncFcn
}

// Async convert blob to one of three types:
// Type can be one of Text, ArrayBuffer, DataURL
// Camel case ok: text, arrayBuffer, dataURL
// export async function blobToData(blob, type = 'dataURL') {
export function blobToData(blob, type = 'dataURL') {
    type = type[0].toUpperCase() + type.slice(1)
    const types = ['Text', 'ArrayBuffer', 'DataURL']
    if (!types.includes(type))
        throw Error('blobToData: data must be one of ' + types.toString())
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.addEventListener('load', () => resolve(reader.result))
        reader.addEventListener('error', e => reject(e))
        reader['readAs' + type](blob)
    })
}

// deprecated, use: await fetch(url).then(res => res.<type>())
// Async Fetch of a url with the response of the given type
// types: arrayBuffer, blob, json, text; default is blob
// See https://developer.mozilla.org/en-US/docs/Web/API/Response#methods
// export async function fetchData(url, type = 'blob') {
//     const types = ['arrayBuffer', 'blob', 'json', 'text']
//     if (!types.includes(type))
//         throw Error('fetchData: data must be one of ' + types.toString())
//     return fetch(url).then(res => res[type]())
// }
// export async function fetchJson(url) {
//     return fetchData(url, 'json')
// }
// export async function fetchText(url) {
//     return fetchData(url, 'text')
// }

// Return a dataURL for the given data. type is a mime type: https://t.ly/vzKm
// If data is a canvas, return data.toDataURL(type), defaulting to image/png
// Otherwise, use btoa/base64, default type text/plain;charset=US-ASCII
export function toDataURL(data, type = undefined) {
    if (data.toDataURL) return data.toDataURL(type, type)
    if (!type) type = 'text/plain;charset=US-ASCII'
    return `data:${type};base64,${btoa(data)}}`
}
export async function blobsEqual(blob0, blob1) {
    const text0 = await blob0.text()
    const text1 = await blob1.text()
    return text0 === text1
}

// I think fetch encompases this for 99% of cases
// /**
//  * Return Promise for ajax/xhr data.
//  *
//  * type: 'arraybuffer', 'blob', 'document', 'json', 'text'.
//  * method: 'GET', 'POST'
//  * use: xhrPromise('./path/to/data').then(data => dataFcn(data))
//  *
//  * @param {UTL} url A URL path to the data to be retrieved
//  * @param {string} [type='text'] The type of the data
//  * @param {string} [method='GET'] The retrieval method
//  * @returns {any} The resulting data of the given type
//  */
// export function xhrPromise(url, type = 'text', method = 'GET') {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest()
//         xhr.open(method, url) // POST mainly for security and large files
//         xhr.responseType = type
//         xhr.onload = () => resolve(xhr.response)
//         xhr.onerror = () =>
//             reject(Error(`Could not load ${url}: ${xhr.status}`))
//         xhr.send()
//     })
// }

/**
 * Return promise for pause of ms.
 * Use: await pause(ms)
 *
 * @param {number} [ms=1000] Number of ms to pause
 * @returns {Promise} A promise to wait this number of ms
 */
// export function timeoutPromise(ms = 1000) {
export function pause(ms = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

/**
 * Use pause for an animation loop.
 * Calls the fcn each step
 * Stops after steps calls, negative means run forever
 *
 * @param {function} fcn The function to be called.
 * @param {number} [steps=-1] How many times, -1 means forever
 * @param {number} [ms=0] Number of ms between calls.
 */
export async function timeoutLoop(fcn, steps = -1, ms = 0) {
    let i = 0
    while (i++ !== steps) {
        fcn(i - 1)
        await pause(ms)
    }
}

export function waitUntilDone(done, ms = 10) {
    return new Promise(resolve => {
        function waitOnDone() {
            if (done()) return resolve()
            else setTimeout(waitOnDone, ms)
        }
        waitOnDone()
    })
}

export async function fetchImageBitmap(url) {
    const blob = await fetch(url).then(res => res.blob())
    const ibm = await createImageBitmap(blob)
    return ibm
}

// // ### Canvas & Image

// function offscreenOK() {
//     // return !!self.OffscreenCanvas
//     // return typeof OffscreenCanvas !== 'undefined'
//     return inWorker()
// }

// /**
//  * Create a blank 2D canvas of a given width/height.
//  *
//  * @param {number} width The canvas height in pixels
//  * @param {number} height The canvas width in pixels
//  * @param {boolean} [offscreen=offscreenOK()] If true, return "Offscreen" canvas
//  * @returns {Canvas} The resulting Canvas object
//  */
// // export function createCanvas(width, height, offscreen = offscreenOK()) {
// //     if (offscreen) return new OffscreenCanvas(width, height)
// //     const can = globalThis?.document?.createElement('canvas')
// //     if (can) {
// //         can.width = width
// //         can.height = height
// //     }
// //     return can
// // }
// export function createCanvas(width, height, offscreen = offscreenOK()) {
//     if (offscreen) return new OffscreenCanvas(width, height)
//     const can = document.createElement('canvas')
//     can.width = width
//     can.height = height
//     return can
// }

// /**
//  * As above, but returing the 2D context object instead of the canvas.
//  * Note ctx.canvas is the canvas for the ctx, and can be use as an image.
//  *
//  * @param {number} width The canvas height in pixels
//  * @param {number} height The canvas width in pixels
//  * @param {boolean} [offscreen=offscreenOK()] If true, return "Offscreen" canvas
//  * @returns {Context2D} The resulting Canvas's 2D context
//  */
// export function createCtx(
//     width,
//     height,
//     offscreen = offscreenOK(),
//     attrs = {}
// ) {
//     const can = createCanvas(width, height, offscreen)
//     return can.getContext('2d', attrs)
// }

// // Duplicate a canvas, preserving it's current image/drawing
// export function cloneCanvas(can, offscreen = offscreenOK()) {
//     const ctx = createCtx(can.width, can.height, offscreen)
//     ctx.drawImage(can, 0, 0)
//     return ctx.canvas
// }
// // Resize a ctx in-place and preserve image.
// export function resizeCtx(ctx, width, height) {
//     const copy = cloneCanvas(ctx.canvas)
//     ctx.canvas.width = width
//     ctx.canvas.height = height
//     ctx.drawImage(copy, 0, 0)
// }
// // Return new canvas scaled by width, height and preserve image.
// export function resizeCanvas(
//     can,
//     width,
//     height = (width / can.width) * can.height
// ) {
//     const ctx = createCtx(width, height)
//     ctx.drawImage(can, 0, 0, width, height)
//     return ctx.canvas
// }

// // Set the ctx/canvas size if differs from width/height.
// // It does not install a transform and assumes there is not one currently installed.
// // The World object can do that for AgentSets.
// export function setCanvasSize(can, width, height) {
//     if (can.width !== width || can.height != height) {
//         can.width = width
//         can.height = height
//     }
// }

// // export function canvasToImage(can) {
// //     var img = new Image()
// //     img.src = can.toDataURL()
// // }

// // Install identity transform for this context.
// // Call ctx.restore() to revert to previous transform.
// export function setIdentity(ctx) {
//     ctx.save() // NOTE: Does not change state, only saves current state.
//     ctx.setTransform(1, 0, 0, 1, 0, 0) // or ctx.resetTransform()
// }
// // Set the text font, align and baseline drawing parameters.
// // Ctx can be either a canvas context or a DOM element
// // See [reference](http://goo.gl/AvEAq) for details.
// // * font is a HTML/CSS string like: "9px sans-serif"
// // * align is left right center start end
// // * baseline is top hanging middle alphabetic ideographic bottom
// export function setTextProperties(
//     ctx,
//     font,
//     textAlign = 'center',
//     textBaseline = 'middle'
// ) {
//     Object.assign(ctx, { font, textAlign, textBaseline })
// }

// // bboxCtx is reused on every call to stringMetrics
// const bboxCtx = createCtx(0, 0)
// export function stringMetrics(
//     string,
//     font,
//     textAlign = 'center',
//     textBaseline = 'middle'
// ) {
//     setTextProperties(bboxCtx, font, textAlign, textBaseline)
//     const metrics = bboxCtx.measureText(string)
//     metrics.height = // not sure how safe this is but..
//         metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
//     return metrics
// }

// // Draw string of the given color at the xy location, in ctx pixel coords.
// // Use setIdentity .. reset if a transform is being used by caller.
// export function drawText(ctx, string, x, y, color, useIdentity = true) {
//     if (useIdentity) setIdentity(ctx)
//     ctx.fillStyle = color.css || color // OK to use Color.typedColor
//     ctx.fillText(string, x, y)
//     if (useIdentity) ctx.restore()
// }

// // Return the (complete) ImageData object for this context object
// export function ctxImageData(ctx) {
//     return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
// }

// // Return ctx data as an array of typed array rgba colors
// export function ctxImageColors(ctx) {
//     const typedArray = ctxImageData(ctx).data
//     const colors = []
//     step(typedArray.length, 4, i => colors.push(typedArray.subarray(i, i + 4)))
//     return colors
// }

// // Return ctx data as an array of Uint32Array rgba pixels
// export function ctxImagePixels(ctx) {
//     const imageData = ctxImageData(ctx)
//     const pixels = new Uint32Array(imageData.data.buffer)
//     return pixels
// }

// // Clear this context using the cssColor.
// // If no color or if color === 'transparent', clear to transparent.
// export function clearCtx(ctx, cssColor = undefined) {
//     const { width, height } = ctx.canvas
//     setIdentity(ctx)
//     if (!cssColor || cssColor === 'transparent') {
//         ctx.clearRect(0, 0, width, height)
//     } else {
//         cssColor = cssColor.css || cssColor
//         ctx.fillStyle = cssColor
//         ctx.fillRect(0, 0, width, height)
//     }
//     ctx.restore()
// }

// // These image functions use "imagable" objects: Image, ImageBitmap, Canvas ...
// // https://developer.mozilla.org/en-US/docs/Web/API/CanvasImageSource

// export function imageToCtx(img) {
//     const ctx = createCtx(img.width, img.height)
//     fillCtxWithImage(ctx, img)
//     return ctx
// }
// export function imageToCanvas(img) {
//     return imageToCtx(img).canvas
// }
// // Fill this context with the given image. Will scale image to fit ctx size.
// export function fillCtxWithImage(ctx, img) {
//     setIdentity(ctx) // set/restore identity
//     ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height)
//     ctx.restore()
// }

// /**
//  * Fill this context with the given image, resizing it to img size if needed.
//  *
//  * @param {Context2D} ctx a canvas 2D context
//  * @param {Image} img the Image to install in this ctx
//  */
// export function setCtxImage(ctx, img) {
//     setCanvasSize(ctx.canvas, img.width, img.height)
//     fillCtxWithImage(ctx, img)
// }

// ### Debug

// error checking:
let skipChecks = false
export function skipErrorChecks(bool) {
    skipChecks = bool
}
export function checkArg(arg, type = 'number', name = 'Function') {
    if (skipChecks) return
    const argType = typeof arg
    if (argType !== type) {
        throw new Error(`${name} expected a ${type}, got ${arg}`)
    }
}
export function checkArgs(argsArray, type = 'number', name = 'Function') {
    if (skipChecks) return
    if (typeOf(argsArray) === 'arguments') argsArray = Array.from(argsArray)
    argsArray.forEach(val => {
        checkArg(val, type, name)
    })
}

// Print a message just once.
const logOnceMsgSet = new Set()
export function logOnce(msg, useWarn = false) {
    if (!logOnceMsgSet.has(msg)) {
        if (useWarn) {
            console.warn(msg)
        } else {
            console.log(msg)
        }
        logOnceMsgSet.add(msg)
    }
}
export function warn(msg) {
    logOnce(msg, true)
}

// Use chrome/ffox/ie console.time()/timeEnd() performance functions
export function timeit(f, runs = 1e5, name = 'test') {
    name = name + '-' + runs
    console.time(name)
    for (let i = 0; i < runs; i++) f(i)
    console.timeEnd(name)
}

// simple performance function.
// Records start & current time, steps, fps
// Each call bumps steps, current time, fps
// Use:
//    const perf = fps()
//    while (perf.steps != 100) {}
//        model.step()
//        perf()
//    }
//    console.log(`Done, steps: ${perf.steps} fps: ${perf.fps}`)
export function fps() {
    const timer = typeof performance === 'undefined' ? Date : performance
    // const start = performance.now()
    const start = timer.now()
    let steps = 0
    function perf() {
        steps++
        // const ms = performance.now() - start
        const ms = timer.now() - start
        const fps = parseFloat((steps / (ms / 1000)).toFixed(2))
        Object.assign(perf, { fps, ms, start, steps })
    }
    perf.steps = 0
    return perf
}

// Print Prototype Stack: see your vars all the way down!
export function pps(obj, title = '') {
    if (title) console.log(title) // eslint-disable-line
    let count = 1
    let str = ''
    while (obj) {
        if (typeof obj === 'function') {
            str = obj.constructor.toString()
        } else {
            const okeys = Object.keys(obj)
            str =
                okeys.length > 0
                    ? `[${okeys.join(', ')}]`
                    : `[${obj.constructor.name}]`
        }
        console.log(`[${count++}]: ${str}`)
        obj = Object.getPrototypeOf(obj)
    }
}

// /**
//  * Merge a module's obj key/val pairs into to the global/window namespace.
//  * Primary use is to make console logging easier when debugging
//  * modules.
//  *
//  * @param {Object} obj Object who's key/val pairs will be installed in window.
//  */
// export function toWindow(obj) {
//     Object.assign(window, obj)
//     console.log('toWindow:', Object.keys(obj).join(', '))
// }
export function logAll(obj) {
    Object.keys(obj).forEach(key => console.log('  ', key, obj[key]))
}

// // Dump model's patches turtles links to window
// export function dump(model = window.model) {
//     const { patches: ps, turtles: ts, links: ls } = model
//     Object.assign(window, { ps, ts, ls })
//     window.p = ps.length > 0 ? ps.oneOf() : {}
//     window.t = ts.length > 0 ? ts.oneOf() : {}
//     window.l = ls.length > 0 ? ls.oneOf() : {}
//     console.log('debug: ps, ts, ls, p, t, l dumped to window')
// }

// ### Dom

// export function addCssLink(url) {
//     const link = document.createElement('link')
//     link.setAttribute('rel', 'stylesheet')
//     link.setAttribute('href', url)
//     document.head.appendChild(link)
// }
// export async function fetchCssStyle(url) {
//     const response = await fetch(url)
//     if (!response.ok) throw Error(`fetchCssStyle: Not found: ${url}`)
//     const css = await response.text()
//     addCssStyle(css)
//     return css
// }
// export function addCssStyle(css) {
//     // document.head.innerHTML += `<style>${css}</style>`
//     const style = document.createElement('style')
//     style.innerHTML = css
//     document.head.appendChild(style)
// }

// // REST:
// // Parse the query, returning an object of key / val pairs.
// export function getQueryString() {
//     return window.location.search.substr(1)
// }
// export function parseQueryString(
//     // paramsString = window.location.search.substr(1)
//     paramsString = getQueryString()
// ) {
//     const results = {}
//     const searchParams = new URLSearchParams(paramsString)
//     for (const pair of searchParams.entries()) {
//         let [key, val] = pair
//         if (val.match(/^[0-9.]+$/) || val.match(/^[0-9.]+e[0-9]+$/))
//             val = Number(val)
//         if (['true', 't', ''].includes(val)) val = true
//         if (['false', 'f'].includes(val)) val = false

//         results[key] = val
//     }
//     return results
// }
// // Merge the querystring into the default parameters
// export function RESTapi(parameters) {
//     return Object.assign(parameters, parseQueryString())
// }

// // Print a message to an html element
// // Default to document.body if in browser.
// // If msg is an object, convert to JSON
// // (object canot have cycles etc)
// // If element is string, find element by ID
// export function printToPage(msg, element = document.body) {
//     // if (isObject(msg)) {
//     if (typeof msg === 'object') {
//         msg = JSON.stringify(msg, null, 2)
//         // msg = '<pre>' + msg + '</pre>'
//     }
//     msg = '<pre>' + msg + '</pre>'

//     if (typeof element === 'string') {
//         element = document.getElementById(element)
//     }

//     element.style.fontFamily = 'monospace'
//     element.innerHTML += msg //+ '<br />'
// }

// // Get element (i.e. canvas) relative x,y position from event/mouse position.
// // http://goo.gl/356S91
// export function getEventXY(element, evt) {
//     const rect = element.getBoundingClientRect()
//     return [evt.clientX - rect.left, evt.clientY - rect.top]
// }

// ### Math

// const { PI, floor, cos, sin, atan2, log, log2, sqrt } = Math
export const PI = Math.PI

/**
 * Returns ramdp, int in [0, max), equal or grater than 0, less than max
 *
 * @param {number} max The max integer to return
 * @returns {number} an integer in  [0, max)
 */
export function randomInt(max) {
    return Math.floor(Math.random() * max)
}

/**
 * Returns an int in [min, max), equal or grater than min, less than max
 *
 * @param {number} min The min integer to return
 * @param {number} max The max integer to return
 * @returns {number} an integer in  [min, max)
 */
export function randomInt2(min, max) {
    return min + Math.floor(Math.random() * (max - min))
}

/**
 * Returns a random float in [0, max)
 *
 * @param {number} max The max float to return
 * @returns {number} a float in [0, max)
 */
export function randomFloat(max) {
    return Math.random() * max
}

/**
 * Returns a random float in [min, max)
 *
 * @param {number} min The min float to return
 * @param {number} max The max float to return
 * @returns {number} a float in [min, max)
 */
export function randomFloat2(min, max) {
    return min + Math.random() * (max - min)
}

/**
 * Return a random float centered around r, in [-r/2, r/2)
 * @param {number} r The center float
 * @returns {number} a float in [-r/2, r/2)
 */
export function randomCentered(r) {
    return randomFloat2(-r / 2, r / 2)
}

// Return float Gaussian normal with given mean, std deviation.
export function randomNormal(mean = 0.0, sigma = 1.0) {
    // Box-Muller
    const [u1, u2] = [1.0 - Math.random(), Math.random()] // ui in 0,1
    const norm = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * PI * u2)
    return norm * sigma + mean
}

/**
 * Install a seeded random generator as Math.random
 * Uses an optimized version of the Park-Miller PRNG.
 *
 * Math.random will return a sequence of "random" numbers in a known
 * sequence. Useful for testing to see if the same results
 * occur in multiple runs of a model with the same parameters.
 *
 * @param {number} [seed=123456]
 */
export function randomSeed(seed = 123456) {
    // doesn't repeat b4 JS dies.
    // https://gist.github.com/blixt/f17b47c62508be59987b
    seed = seed % 2147483647
    Math.random = () => {
        seed = (seed * 16807) % 2147483647
        return (seed - 1) / 2147483646
    }
}

/**
 * Round a number to be of a given decimal precision.
 * If the number is an array, round each item in the array
 *
 * @param {number|Array} num The number to convert/shorten
 * @param {number} [digits=4] The number of decimal digits
 * @returns {number} The resulting number
 */
export function precision(num, digits = 4) {
    // if (num === -0) return 0 // deno doesn't like this
    if (Math.abs(num) === 0) return 0
    if (Array.isArray(num)) return num.map(val => precision(val, digits))
    const mult = 10 ** digits
    return Math.round(num * mult) / mult
}

// Return whether num is [Power of Two](http://goo.gl/tCfg5). Very clever!
export const isPowerOf2 = num => (num & (num - 1)) === 0 // twgl library
// Return next greater power of two. There are faster, see:
// [Stack Overflow](https://goo.gl/zvD78e)
export const nextPowerOf2 = num => Math.pow(2, Math.ceil(Math.log2(num)))

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
// The modulus is defined as: x - y * floor(x / y)
// It is not %, the remainder function.
/**
 * A true modulus function, differing from the % remainder operation.
 *
 * @param {number} v The value to calculate the modulus of
 * @param {number} n The number relative to which the modulus is calculated.
 * @returns {number} The value of v mod n
 */
export function mod(v, n) {
    return ((v % n) + n) % n // v - n * Math.floor(v / n)
}

// Wrap v around min, max values if v outside min, max
export const wrap = (v, min, max) => min + mod(v - min, max - min)

/**
 * Clamp a float to be between [min, max).
 *
 * @param {number} v value to clamp between min & max
 * @param {number} min min value
 * @param {number} max max value
 * @returns {number} a float between min/max
 */
export function clamp(v, min, max) {
    if (v < min) return min
    if (v > max) return max
    return v
}
// Return true is val in [min, max] enclusive
export const isBetween = (val, min, max) => min <= val && val <= max

// Return a linear interpolation between lo and hi.
// Scale is in [0-1], a percentage, and the result is in [lo,hi]
// If lo>hi, scaling is from hi end of range.
// [Why the name `lerp`?](http://goo.gl/QrzMc)
export const lerp = (lo, hi, scale) =>
    lo <= hi ? lo + (hi - lo) * scale : lo - (lo - hi) * scale
// Calculate the lerp scale given lo/hi pair and a number between them.
// Clamps number to be between lo & hi.
export function lerpScale(number, lo, hi) {
    if (lo === hi) throw Error('lerpScale: lo === hi')
    number = clamp(number, lo, hi)
    return (number - lo) / (hi - lo)
}

// ### Geometry

// Degrees & Radians
// Note: quantity, not coord system xfm
// const toDegrees = 180 / PI
// const toRadians = PI / 180
export const toDeg = 180 / Math.PI
export const toRad = Math.PI / 180
/**
 * Convert from degrees to radians
 *
 * @param {number} degrees a value in degrees: in [0, 360)
 * @returns {number} the value as radians: in [0, 2PI)
 */
export function degToRad(degrees) {
    return mod2pi(degrees * toRad)
}
/**
 * Convert from radians to degrees
 *
 * @param {number} radians a value in radians: in [0, 2PI)
 * @returns {number} the value as degrees: in [0, 360)
 */
export function radToDeg(radians) {
    return mod360(radians * toDeg)
}
// export const radToDeg = radians => mod360(radians * toDeg)
// Wow. surprise: headingToDeg = degToHeading! Just like above.
// deg is absolute eucledian degrees direction
export const degToHeading = degrees => mod360(90 - degrees)
export const headingToDeg = heading => mod360(90 - heading)
export function mod360(degrees) {
    return mod(degrees, 360)
}
export function mod2pi(radians) {
    return mod(radians, 2 * PI)
}
export function modpipi(radians) {
    return mod(radians, 2 * PI) - PI
}
export function mod180180(degrees) {
    return mod360(degrees) - 180
}

// Heading & Radians: coord system
// * Heading is 0-up (y-axis), clockwise angle measured in degrees.
// * Rad is euclidean: 0-right (x-axis), counterclockwise in radians
/**
 * Convert from radians to heading
 *
 * Heading is 0-up (y-axis), clockwise angle measured in degrees.
 * Radians is euclidean: 0-right (x-axis), counterclockwise in radians
 *
 * @param {number} radians a value in radians: in [0, 2PI)
 * @returns {number} a value in degrees: in [0, 360)
 */
export function radToHeading(radians) {
    const deg = radians * toDeg
    return mod360(90 - deg)
}
/**
 * Convert from heading to radians
 *
 * @param {number} heading a value in degrees: in [0, 360)
 * @returns {number} a value in radians: in [0, 2PI)
 */
export function headingToRad(heading) {
    const deg = mod360(90 - heading)
    return deg * toRad
}

// Relative angles in heading space: deg Heading => -deg Eucledian
export function radToHeadingAngle(radians) {
    return -radToDeg(radians)
}
export function headingAngleToRad(headingAngle) {
    return -degToRad(headingAngle)
}

// headingsEq === degreesEq
export function degreesEqual(deg1, deg2) {
    return mod360(deg1) === mod360(deg2)
}
export function radsEqual(rads1, rads2) {
    return mod2pi(rads1) === mod2pi(rads2)
}
export const headingsEq = degreesEqual

// Return angle (radians) in (-pi,pi] that added to rad0 = rad1
// See NetLogo's [subtract-headings](http://goo.gl/CjoHuV) for explanation
export function subtractRadians(rad1, rad0) {
    let dr = mod2pi(rad1 - rad0) // - PI
    if (dr > PI) dr = dr - 2 * PI
    return dr
}
// Above using headings (degrees) returning degrees in (-180, 180]
export function subtractDegrees(deg1, deg0) {
    let dAngle = mod360(deg1 - deg0) // - 180
    if (dAngle > 180) dAngle = dAngle - 360
    return dAngle
}
/**
 * Subtract two headings, returning the smaller difference.
 *
 * Computes the difference between the given headings, that is,
 * the number of degrees in the smallest angle by which heading2
 * could be rotated to produce heading1
 * See NetLogo's [subtract-headings](http://goo.gl/CjoHuV) for explanation
 * @param {number} head1 The first heading in degrees
 * @param {number} head0 The second heading in degrees
 * @returns {number} The smallest andle from head0 to head1
 */
export function subtractHeadings(head1, head0) {
    return -subtractDegrees(head1, head0)
}

// Return angle in [-pi,pi] radians from (x,y) to (x1,y1)
// [See: Math.atan2](http://goo.gl/JS8DF)
export function radiansTowardXY(x, y, x1, y1) {
    return Math.atan2(y1 - y, x1 - x)
}
// Above using headings (degrees) returning degrees in [-90, 90]
export function headingTowardXY(x, y, x1, y1) {
    return radToHeading(radiansTowardXY(x, y, x1, y1))
}
// Above using degrees returning degrees in [-90, 90]
export function degreesTowardXY(x, y, x1, y1) {
    return radToDeg(radiansTowardXY(x, y, x1, y1))
}

// Return true if x,y is within cone.
// Cone: origin x0,y0 in direction angle, with coneAngle width in radians.
// All angles in radians
export function inCone(x, y, radius, coneAngle, direction, x0, y0) {
    if (sqDistance(x0, y0, x, y) > radius * radius) return false
    const angle12 = radiansTowardXY(x0, y0, x, y) // angle from 1 to 2
    return coneAngle / 2 >= Math.abs(subtractRadians(direction, angle12))
}

// AltAz: Alt is deg from xy plane, 180 up, -180 down, Az is heading
// We choose Phi radians from xy plane, "math" is often from Z axis
// REMIND: some prefer -90, 90
// export function altAzToAnglePhi(alt, az) {
//     const angle = headingToRad(az)
//     const phi = modpipi(alt * toRad)
//     return [angle, phi]
// }
// export function anglePhiToAltAz(angle, phi) {
//     const az = radToHeading(angle)
//     const alt = mod180180(phi * toDeg)
//     return [alt, az]
// }

// Return distance between (x, y), (x1, y1)
export const sqDistance = (x, y, x1, y1) => (x - x1) ** 2 + (y - y1) ** 2
export const distance = (x, y, x1, y1) => Math.sqrt(sqDistance(x, y, x1, y1))
export const sqDistance3 = (x, y, z, x1, y1, z1) =>
    (x - x1) ** 2 + (y - y1) ** 2 + (z - z1) ** 2
export const distance3 = (x, y, z, x1, y1, z1) =>
    Math.sqrt(sqDistance3(x, y, z, x1, y1, z1))

// ### Models

// model can be:
// - a path to the class Model. uses Model.default. careful! use import.meta
// - a class Model
// - a model
// if either of the first two, they're converted to a model
// the model is called w/ default, no args.. i.e. model()
// async arg: if true use timeoutLoop, otherwise a simple for loop
export async function runModel(model, steps = 500, useSeed = true) {
    console.log('runModel: model', model)
    if (useSeed) randomSeed()

    // if passing in a url, remember that util.js is in the src/ scope
    if (isString(model)) model = (await import(model)).default
    if (isFunction(model)) model = new model() // model is a class

    // console.log('runModel model', model)

    await model.startup()
    model.setup()
    if (inMain()) {
        await timeoutLoop(() => {
            model.step()
        }, steps)
    } else {
        for (let i = 0; i < steps; i++) model.step()
    }
    return model
}

export function toJSON(obj, indent = 0, topLevelArrayOK = true) {
    let firstCall = topLevelArrayOK
    const blackList = ['rectCache']
    const json = JSON.stringify(
        obj,
        (key, val) => {
            if (blackList.includes(key)) {
                // if (key === 'rectCache') return val.length
                return undefined
            }
            const isAgentArray =
                Array.isArray(val) &&
                val.length > 0 &&
                Number.isInteger(val[0].id)

            if (isAgentArray && !firstCall) {
                return val.map(v => v.id)
            }

            firstCall = false
            return val
        },
        indent
    )
    return json
}

/**
 * Return an object with samples of the models components.
 * Useful for testing Models without needing a View, just data.
 *
 * @param {Model} model A model to sample
 * @returns {Object} An object with all the samples
 */
export function sampleModel(model) {
    const obj = {
        ticks: model.ticks,
        model: Object.keys(model),
        patches: model.patches.length,
        patch: model.patches.oneOf(),
        turtles: model.turtles.length,
        turtle: model.turtles.oneOf(),
        links: model.links.length,
        link: model.links.oneOf(),
    }
    const json = toJSON(obj)
    return JSON.parse(json)
}

// ### Arrays, Objects and Iteration

// Three handy functions for defaults & properties
// Identity fcn, returning its argument unchanged. Used in callbacks
export const identityFcn = o => o
// No-op function, does nothing. Used for default callback.
export const noopFcn = () => {}
// Return function returning an object's property.  Property in fcn closure.
export const propFcn = prop => o => o[prop]

export function arraysEqual(a1, a2) {
    if (a1.length !== a2.length) return false
    for (let i = 0; i < a1.length; i++) {
        // if (a1[i] !== a2[i]) console.log('arraysEqual: unequal at', i)
        if (a1[i] !== a2[i]) return false
    }
    return true
}

export function removeArrayItem(array, item) {
    const ix = array.indexOf(item)
    if (ix !== -1) {
        array.splice(ix, 1)
    } else {
        throw Error(`removeArrayItem: ${item} not in array`)
    }
    // else console.log(`removeArrayItem: ${item} not in array`)
    return array // for chaining
}
// Return a string representation of an array of arrays
export const arraysToString = arrays => arrays.map(a => `${a}`).join(',')

// Execute fcn for all own member of an obj or array (typed OK).
// Return input arrayOrObj, transformed by fcn.
// - Unlike forEach, does not skip undefines.
// - Like map, forEach, etc, fcn = fcn(item, key/index, obj).
// - Alternatives are: `for..of`, array map, reduce, filter etc
export function forLoop(arrayOrObj, fcn) {
    if (arrayOrObj.slice) {
        // typed & std arrays
        for (let i = 0, len = arrayOrObj.length; i < len; i++) {
            fcn(arrayOrObj[i], i, arrayOrObj)
        }
    } else {
        // obj
        Object.keys(arrayOrObj).forEach(k => fcn(arrayOrObj[k], k, arrayOrObj))
    }
}
// Repeat function f(i, a) n times, i in 0, n-1
// a is optional array, default a new Array.
// Return a.
/**
 * Repeats the function f(i, a) i in 0, n-1.
 * a is an optional array, default a new empty Array
 * returns a, only needed if f() places data in a
 *
 * @param {number} n An integer number of times to run f()
 * @param {function} f The function called.
 * @param {Array} [a=[]] An optional array for use by f()
 * @returns {Array} The result of calling f() n times
 */
export function repeat(n, f, a = []) {
    for (let i = 0; i < n; i++) f(i, a)
    return a
}
// Repeat function n times, incrementing i by step each call.
export function step(n, step, f) {
    for (let i = 0; i < n; i += step) f(i)
}
// Return range [0, length-1]. Note: 6x faster than Array.from!
export function range(length) {
    return repeat(length, (i, a) => {
        a[i] = i
    })
}

export function grep(array, regex) {
    return array.reduce((acc, val) => {
        if (regex.test(val)) acc.push(val)
        return acc
    }, [])
}

// Return a new array that is the concatination two arrays.
// The resulting Type is that of the first array.
export function concatArrays(array1, array2) {
    const Type = array1.constructor
    if (Type === Array) {
        return array1.concat(convertArrayType(array2, Array))
    }
    const array = new Type(array1.length + array2.length)
    // NOTE: typedArray.set() allows any Array or TypedArray arg
    array.set(array1)
    array.set(array2, array1.length)
    return array
}

// Convert obj to string via JSON. Use indent = 0 for one-liner
// jsKeys true removes the jsonKeys quotes
export function objectToString(obj, indent = 2, jsKeys = true) {
    let str = JSON.stringify(obj, null, indent)
    if (jsKeys) str = str.replace(/"([^"]+)":/gm, '$1:')
    return str
}

// Compare Objects or Arrays via JSON string. Note: TypedArrays !== Arrays
export const objectsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Return random item from an array
 *
 * @param {Array} An array to choose from
 * @returns {any} The chosen item
 */
// Return random one of array items.
export function oneOf(array) {
    return array[randomInt(array.length)]
}
export function otherOneOf(array, item) {
    if (array.length < 2) throw Error('otherOneOf: array.length < 2')
    let other
    do {
        other = oneOf(array)
    } while (item === other) // note var use
    return other
}

// Random key/val of object
export const oneKeyOf = obj => oneOf(Object.keys(obj))
export const oneValOf = obj => obj[oneKeyOf(obj)]

// You'd think this wasn't necessary, but I always forget. Damn.
// NOTE: this, like sort, sorts in place. Clone array if needed.
export function sortNums(array, ascending = true) {
    return array.sort((a, b) => (ascending ? a - b : b - a))
}
// Sort an array of objects w/ fcn(obj) as compareFunction.
// If fcn is a string, convert to propFcn.
export function sortObjs(array, fcn, ascending = true) {
    if (typeof fcn === 'string') fcn = propFcn(fcn)
    const comp = (a, b) => fcn(a) - fcn(b)
    return array.sort((a, b) => (ascending ? comp(a, b) : -comp(a, b)))
}
// Randomize array in-place. Use clone() first if new array needed
// The array is returned for chaining; same as input array.
// See [Durstenfeld / Fisher-Yates-Knuth shuffle](https://goo.gl/mfbdPh)
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomInt(i)
        ;[array[j], array[i]] = [array[i], array[j]]
        // const temp = array[i]
        // array[i] = array[j]
        // array[j] = temp
    }
    return array
}

// Set operations on arrays
// union: elements in a1 or a2
export function union(a1, a2) {
    return Array.from(new Set(a1.concat(a2)))
}
// intersection: elements in a1 and a2
export function intersection(a1, a2) {
    // intersection = new Set([...set1].filter(x => set2.has(x)))
    const set2 = new Set(a2)
    return a1.filter(x => set2.has(x))
}
// Difference: elements from a1 not in a2
export function difference(a1, a2) {
    // difference = new Set([...set1].filter(x => !set2.has(x)))
    const set2 = new Set(a2)
    return a1.filter(x => !set2.has(x))
}

// Return a "ramp" (array of uniformly ascending/descending floats)
// in [start,stop] with numItems (positive integer > 1).
// OK for start>stop. Will always include start/stop w/in float accuracy.
export function floatRamp(start, stop, numItems) {
    // NOTE: start + step*i, where step is (stop-start)/(numItems-1),
    // has float accuracy problems, must recalc step each iteration.
    if (numItems <= 1) throw Error('floatRamp: numItems must be > 1')
    const a = []
    for (let i = 0; i < numItems; i++) {
        a.push(start + (stop - start) * (i / (numItems - 1)))
    }
    return a
}
// Integer version of floatRamp, start & stop integers, rounding each element.
// Default numItems yields unit step between start & stop.
export function integerRamp(start, stop, numItems = stop - start + 1) {
    return floatRamp(start, stop, numItems).map(a => Math.round(a))
}

// Return an array normalized (lerp) between lo/hi values
// export function normalize(array, lo = 0, hi = 1) {
//     const [min, max] = [arrayMin(array), arrayMax(array)]
//     const scale = 1 / (max - min)
//     return array.map(n => lerp(lo, hi, scale * (n - min)))
// }
// // Return Uint8ClampedArray normalized in 0-255
// export function normalize8(array) {
//     return new Uint8ClampedArray(normalize(array, -0.5, 255.5))
// }
// // Return Array normalized to integers in lo-hi
// export function normalizeInt(array, lo, hi) {
//     return normalize(array, lo, hi).map(n => Math.round(n))
// }

// get nested property like obj.foo.bar.baz:
//   const val = nestedProperty(obj, 'foo.bar.baz')
// Optimized for path length up to 4, else uses path.reduce()
export function nestedProperty(obj, path) {
    if (typeof path === 'string') path = path.split('.')
    switch (path.length) {
        case 1:
            return obj[path[0]]
        case 2:
            return obj[path[0]][path[1]]
        case 3:
            return obj[path[0]][path[1]][path[2]]
        case 4:
            return obj[path[0]][path[1]][path[2]][path[3]]
        default:
            return path.reduce((obj, param) => obj[param], obj)
    }
}

export const arrayLast = array => array[array.length - 1]
export const arrayMax = array => array.reduce((a, b) => Math.max(a, b))
export const arrayMin = array => array.reduce((a, b) => Math.min(a, b))
export const arrayExtent = array => [arrayMin(array), arrayMax(array)]
export const arraysDiff = (a1, a2, ifcn = i => i) => {
    if (a1.length !== a2.length)
        return console.log('lengths differ', a1.length, a2.length)
    const diffs = []
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) diffs.push([ifcn(i), a1[i], a2[i]])
    }
    return diffs
}

export function arrayToMatrix(array, width, height) {
    if (array.length !== width * height)
        throw Error('arrayToMatrix: length !== width * height')

    const matrix = []
    for (let i = 0; i < height; i++) {
        const row = array.slice(i * width, (i + 1) * width)
        matrix.push(row)
    }

    return matrix
}
export const matrixToArray = matrix => matrix.flat()

// ### OofA/AofO

export function isOofA(data) {
    if (!isObject(data)) return false
    return Object.values(data).every(v => isTypedArray(v))
}
export function toOofA(aofo, spec) {
    const length = aofo.length
    const keys = Object.keys(spec)
    const oofa = {}
    keys.forEach(k => {
        oofa[k] = new spec[k](length)
    })
    forLoop(aofo, (o, i) => {
        keys.forEach(key => (oofa[key][i] = o[key]))
    })
    return oofa
}
export function oofaObject(oofa, i, keys) {
    const obj = {}
    keys.forEach(key => {
        obj[key] = oofa[key][i]
    })
    return obj
}
export function toAofO(oofa, keys = Object.keys(oofa)) {
    const length = oofa[keys[0]].length
    const aofo = new Array(length)
    forLoop(aofo, (val, i) => {
        aofo[i] = oofaObject(oofa, i, keys)
    })
    return aofo
}
export function oofaBuffers(postData) {
    const buffers = []
    forLoop(postData, obj => forLoop(obj, a => buffers.push(a.buffer)))
    return buffers
}
// ### Types

// Fix the javascript typeof operator https://goo.gl/Efdzk5
export const typeOf = obj =>
    ({}.toString
        .call(obj)
        .match(/\s(\w+)/)[1]
        .toLowerCase())
export const isType = (obj, string) => typeOf(obj) === string
export const isOneOfTypes = (obj, array) => array.includes(typeOf(obj))

export const isString = obj => isType(obj, 'string')
export const isObject = obj => isType(obj, 'object')
// export const isArray = obj => isType(obj, 'array')
export const isArray = obj => Array.isArray(obj)
export const isNumber = obj => isType(obj, 'number')
export const isInteger = n => Number.isInteger(n)
// export const isFloat = n => isNumber(n) && n % 1 !== 0 // https://goo.gl/6MS0Tm
export const isFunction = obj => isType(obj, 'function')
export const isImage = obj => isType(obj, 'image')

// Is a number an integer (rather than a float w/ non-zero fractional part)
export const isCanvas = obj =>
    isOneOfTypes(obj, ['htmlcanvaselement', 'offscreencanvas'])
export const isImageable = obj =>
    isOneOfTypes(obj, [
        'image',
        'htmlimageelement',
        'htmlcanvaselement',
        'offscreencanvas',
        'imagebitmap',
    ])

// Typed Arrays:
export const isTypedArray = obj => typeOf(obj.buffer) === 'arraybuffer'
export const isUintArray = obj => /^uint.*array$/.test(typeOf(obj))
export const isIntArray = obj => /^int.*array$/.test(typeOf(obj))
export const isFloatArray = obj => /^float.*array$/.test(typeOf(obj))

export const isArrayLike = obj => isArray(obj) || isTypedArray(obj)
export const isColorLikeArray = obj =>
    isArrayLike(obj) &&
    [3, 4].includes(obj.length) &&
    obj.every(
        i =>
            (isInteger(i) && isBetween(i, 0, 255)) ||
            (isNumber(i) && isBetween(i, 0, 1))
    )

export function isLittleEndian() {
    const d32 = new Uint32Array([0x01020304])
    return new Uint8ClampedArray(d32.buffer)[0] === 4
}

// Convert Array or TypedArray to given Type (Array or TypedArray).
// Result same length as array, precision may be lost.
export function convertArrayType(array, Type) {
    const Type0 = array.constructor
    if (Type0 === Type) return array // return array if already same Type
    return Type.from(array) // Use .from (both TypedArrays and Arrays)
}

export function isDataSet(obj) {
    // return typeOf(obj) === 'object' && obj.width != null && obj.height != null
    return typeOf(obj) === 'object' && obj.width && obj.height && obj.data
}

// Unused:
// export const isWebglArray = obj =>
//     Array.isArray(obj) && obj.length === 3 && util.arrayMax(obj) <= 1
// isHtmlElement: obj => /^html.*element$/.test(typeOf(obj))
// isImage: obj => isType(obj, 'image')
// isImageBitmap: obj => isType(obj, 'imagebitmap')
// // Is undefined, null, bool, number, string, symbol
// isPrimitive: obj => obj == null || 'object' != typeof obj
// Return array's type (Array or TypedArray variant)
// typeName: obj => obj.constructor.name
