import {
    inWorker,
    inMain,
    inDeno,
    typeOf,
    isDataSet,
    isTypedArray,
    isObject,
    step,
} from './jsUtils.js'

// function inWorker() {
//     // return !inNode() && typeof self.window === 'undefined'
//     return globalThis.WorkerGlobalScope !== undefined
// }

// ### Async & I/O

// download canvas as png or jpeg. Canvas can be a dataURL.
// quality is default. For lossless jpeg, set to 1
export function downloadCanvas(can, name = 'download.png', quality = null) {
    if (!(name.endsWith('.png') || name.endsWith('.jpeg'))) name = name + '.png'

    const type = name.endsWith('.png') ? 'image/png' : 'image/jpeg'
    const url = typeOf(can) === 'string' ? can : can.toDataURL(type, quality)

    const link = document.createElement('a')
    link.download = name
    link.href = url
    link.click()
}
// blobable = ArrayBuffer, ArrayBufferView, Blob, String
// Objects & Arrays too, converted to json
export function downloadBlob(blobable, name = 'download', format = true) {
    if (isDataSet(blobable) && !Array.isArray(blobable.data))
        blobable.data = Array.from(blobable.data)
    if (isTypedArray(blobable)) blobable = Array.from(blobable)
    if (isObject(blobable) || Array.isArray(blobable))
        blobable = format
            ? JSON.stringify(blobable, null, 2)
            : JSON.stringify(blobable)

    const blob = typeOf(blobable) === 'blob' ? blobable : new Blob([blobable])
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.download = name
    link.href = url
    link.click()

    URL.revokeObjectURL(url)
}

// ### Canvas & Image

/**
 * Return a Promise for getting an image.
 *
 * use: imagePromise('./path/to/img').then(img => imageFcn(img))
 * or: await imagePromise('./path/to/img')
 *
 * @param {string} url URL for path to image
 * @returns {Promise} A promise resolving to the image
 */
export async function imagePromise(url, preferDOM = true) {
    // if (inMain() || inDeno()) {
    if ((inMain() && preferDOM) || inDeno()) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'Anonymous'
            img.onload = () => resolve(img)
            img.onerror = () => reject(`Could not load image ${url}`)
            img.src = url
        })
        // } else if (inDeno()) {
        //     // return loadImage(url)
        //     console.log('inDeno: url', url, 'Image', Image)
        //     const img = new Image(url) // needs install in deno function
        //     console.log('inDeno: img', img)
        //     await pause(1000)
        //     console.log('inDeno: img', img)
        //     return img
    } else if (inWorker() || !preferDOM) {
        // { mode: 'cors' } ?
        const blob = await fetch(url).then(response => response.blob())
        return createImageBitmap(blob)
    }
}

// export function imageSize(img) {
//     if (inDeno()) {
//         return [img.width(), img.height()]
//     } else {
//         return [img.width, img.height]
//     }
// }

// function offscreenOK() {
//     // return !!self.OffscreenCanvas
//     // return typeof OffscreenCanvas !== 'undefined'
//     return inWorker()
// }

/**
 * Create a blank 2D canvas of a given width/height.
 *
 * @param {number} width The canvas height in pixels
 * @param {number} height The canvas width in pixels
 * @param {boolean} [preferDOM=false] If false, return "Offscreen" canvas
 * @returns {Canvas} The resulting Canvas object
 */
// export function createCanvas(width, height, offscreen = offscreenOK()) {
//     if (offscreen) return new OffscreenCanvas(width, height)
//     const can = document.createElement('canvas')
//     can.width = width
//     can.height = height
//     return can
// }
export function createCanvas(width, height, preferDOM = true) {
    if (inMain() && preferDOM) {
        const can = document.createElement('canvas')
        can.width = width
        can.height = height
        return can
    } else if (inDeno()) {
        return globalThis.createCanvas(width, height)
    } else if (inWorker() || !preferDOM) {
        return new OffscreenCanvas(width, height)
    }
}

/**
 * As above, but returing the 2D context object instead of the canvas.
 * Note ctx.canvas is the canvas for the ctx, and can be use as an image.
 *
 * @param {number} width The canvas height in pixels
 * @param {number} height The canvas width in pixels
 * @param {boolean} [offscreen=offscreenOK()] If true, return "Offscreen" canvas
 * @returns {Context2D} The resulting Canvas's 2D context
 */
export function createCtx(width, height, preferDOM = true, attrs = {}) {
    // const can = createCanvas(width, height, offscreen)
    // return can.getContext('2d', attrs)
    const can = createCanvas(width, height, preferDOM)
    const ctx = can.getContext('2d', attrs)
    if (inDeno()) {
        const ctxObj = {
            canvas: can,
        }
        Object.setPrototypeOf(ctxObj, ctx)
        return ctxObj
    } else {
        return ctx
    }
}

// FIX or drop
// Duplicate a canvas, preserving it's current image/drawing
export function cloneCanvas(can, preferDOM = true) {
    const ctx = createCtx(can.width, can.height, preferDOM)
    ctx.drawImage(can, 0, 0)
    return ctx.canvas
}
// Resize a ctx in-place and preserve image. SpriteSheet
export function resizeCtx(ctx, width, height) {
    const copy = cloneCanvas(ctx.canvas)
    ctx.canvas.width = width
    ctx.canvas.height = height
    ctx.drawImage(copy, 0, 0)
}
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

// Set the ctx/canvas size if differs from width/height.
// It does not install a transform and assumes there is not one currently installed.
// The World object can do that for AgentSets.
// Can move to World
export function setCanvasSize(can, width, height) {
    if (can.width !== width || can.height != height) {
        can.width = width
        can.height = height
    }
}

// export function canvasToImage(can) {
//     var img = new Image()
//     img.src = can.toDataURL()
// }

// Install identity transform for this context.
// Call ctx.restore() to revert to previous transform.
export function setIdentity(ctx) {
    ctx.save() // NOTE: Does not change state, only saves current state.
    ctx.resetTransform() // or ctx.setTransform(1, 0, 0, 1, 0, 0)
}
// Set the text font, align and baseline drawing parameters.
// Ctx can be either a canvas context or a DOM element
// See [reference](http://goo.gl/AvEAq) for details.
// * font is a HTML/CSS string like: "9px sans-serif"
// * align is left right center start end
// * baseline is top hanging middle alphabetic ideographic bottom
export function setTextProperties(
    ctx,
    font,
    textAlign = 'center',
    textBaseline = 'middle'
) {
    Object.assign(ctx, { font, textAlign, textBaseline })
}

// bboxCtx is reused on every call to stringMetrics
// const bboxCtx = createCtx(0, 0)
let bboxCtx
export function stringMetrics(
    string,
    font,
    textAlign = 'center',
    textBaseline = 'middle'
) {
    // bboxCtx ??= createCtx(0, 0)
    if (!bboxCtx) bboxCtx = createCtx(0, 0)
    setTextProperties(bboxCtx, font, textAlign, textBaseline)
    const metrics = bboxCtx.measureText(string)
    metrics.height = // not sure how safe this is but..
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    return metrics
}

// Draw string of the given color at the xy location, in ctx pixel coords.
// Use setIdentity .. reset if a transform is being used by caller.
export function drawText(ctx, string, x, y, color, useIdentity = true) {
    if (useIdentity) setIdentity(ctx)
    ctx.fillStyle = color.css || color // OK to use Color.typedColor
    ctx.fillText(string, x, y)
    if (useIdentity) ctx.restore()
}

// Return the (complete) ImageData object for this context object
export function ctxImageData(ctx) {
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
}

// Return ctx data as an array of typed array rgba colors
export function ctxImageColors(ctx) {
    const typedArray = ctxImageData(ctx).data
    const colors = []
    step(typedArray.length, 4, i => colors.push(typedArray.subarray(i, i + 4)))
    return colors
}

// Return ctx data as an array of Uint32Array rgba pixels
export function ctxImagePixels(ctx) {
    const imageData = ctxImageData(ctx)
    const pixels = new Uint32Array(imageData.data.buffer)
    return pixels
}

// Clear this context using the cssColor.
// If no color or if color === 'transparent', clear to transparent.
export function clearCtx(ctx, cssColor = undefined) {
    const { width, height } = ctx.canvas
    setIdentity(ctx)
    if (!cssColor || cssColor === 'transparent') {
        ctx.clearRect(0, 0, width, height)
    } else {
        cssColor = cssColor.css || cssColor
        ctx.fillStyle = cssColor
        ctx.fillRect(0, 0, width, height)
    }
    ctx.restore()
}

// These image functions use "imagable" objects: Image, ImageBitmap, Canvas ...
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasImageSource

export function imageToCtx(img) {
    // const [width, height] = imageSize(img)
    const { width, height } = img
    const ctx = createCtx(width, height)
    // const ctx = createCtx(img.width, img.height)
    fillCtxWithImage(ctx, img)
    return ctx
}
export function imageToCanvas(img) {
    return imageToCtx(img).canvas
}
// Fill this context with the given image. Will scale image to fit ctx size.
export function fillCtxWithImage(ctx, img) {
    setIdentity(ctx) // set/restore identity
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.restore()
}

/**
 * Fill this context with the given image, resizing it to img size if needed.
 *
 * @param {Context2D} ctx a canvas 2D context
 * @param {Image} img the Image to install in this ctx
 */
export function setCtxImage(ctx, img) {
    setCanvasSize(ctx.canvas, img.width, img.height)
    fillCtxWithImage(ctx, img)
}

// ### Debug

/**
 * Merge a module's obj key/val pairs into to the global/window namespace.
 * Primary use is to make console logging easier when debugging
 * modules.
 *
 * @param {Object} obj Object who's key/val pairs will be installed in window.
 */
export function toWindow(obj) {
    Object.assign(window, obj)
    console.log('toWindow:', Object.keys(obj).join(', '))
}

export function dump(model = window.model) {
    const { patches: ps, turtles: ts, links: ls } = model
    Object.assign(window, { ps, ts, ls })
    window.p = ps.length > 0 ? ps.oneOf() : {}
    window.t = ts.length > 0 ? ts.oneOf() : {}
    window.l = ls.length > 0 ? ls.oneOf() : {}
    console.log('debug: ps, ts, ls, p, t, l dumped to window')
}

// ### Dom

export function addCssLink(url) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('href', url)
    document.head.appendChild(link)
}
export async function fetchCssStyle(url) {
    const response = await fetch(url)
    if (!response.ok) throw Error(`fetchCssStyle: Not found: ${url}`)
    const css = await response.text()
    addCssStyle(css)
    return css
}
export function addCssStyle(css) {
    // document.head.innerHTML += `<style>${css}</style>`
    const style = document.createElement('style')
    style.innerHTML = css
    document.head.appendChild(style)
}

// REST:
// Parse the query, returning an object of key / val pairs.
export function getQueryString() {
    return window.location.search.substr(1)
}
export function parseQueryString(
    // paramsString = window.location.search.substr(1)
    paramsString = getQueryString()
) {
    const results = {}
    const searchParams = new URLSearchParams(paramsString)
    for (const pair of searchParams.entries()) {
        let [key, val] = pair
        if (val.match(/^[0-9.]+$/) || val.match(/^[0-9.]+e[0-9]+$/))
            val = Number(val)
        if (['true', 't', ''].includes(val)) val = true
        if (['false', 'f'].includes(val)) val = false

        results[key] = val
    }
    return results
}
// Merge the querystring into the default parameters
export function RESTapi(parameters) {
    return Object.assign(parameters, parseQueryString())
}

// Print a message to an html element
// Default to document.body if in browser.
// If msg is an object, convert to JSON
// (object canot have cycles etc)
// If element is string, find element by ID
export function printToPage(msg, element = document.body) {
    // if (isObject(msg)) {
    if (typeof msg === 'object') {
        msg = JSON.stringify(msg, null, 2)
        // msg = '<pre>' + msg + '</pre>'
    }
    msg = '<pre>' + msg + '</pre>'

    if (typeof element === 'string') {
        element = document.getElementById(element)
    }

    element.style.fontFamily = 'monospace'
    element.innerHTML += msg //+ '<br />'
}

// Get element (i.e. canvas) relative x,y position from event/mouse position.
// http://goo.gl/356S91
export function getEventXY(element, evt) {
    const rect = element.getBoundingClientRect()
    return [evt.clientX - rect.left, evt.clientY - rect.top]
}

// ### Math

// ### Geometry

// ### Models

// ### Arrays, Objects and Iteration

// ### OofA/AofO

// ### Types

// could have some of the types that are dom oriented. TypedArrays too?
